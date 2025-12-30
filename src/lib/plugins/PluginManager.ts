import type { Plugin, PluginContext, PluginManifest, PluginNodeDefinition } from './interfaces';
// import { Registry } from '../compiler/Registry';
// @ts-ignore
import { registerNodeDefinition, unregisterNodeDefinition } from '../../nodes/index';
// @ts-ignore
import { BotNode, Sockets, InputControl } from '../railgun-rete';
// @ts-ignore
import { ClassicPreset } from 'rete';

const fs = window.require('fs');
const path = window.require('path');
const { app } = window.require('@electron/remote');

export class PluginManager {
    static plugins: Map<string, Plugin> = new Map();
    static libraryDir = path.join(app.getPath('documents'), 'railgun', 'plugins');
    static activePluginsDir = PluginManager.libraryDir;

    static async init(projectPath?: string) {
        // If project path provided, use its plugins dir
        if (projectPath) {
            this.activePluginsDir = path.join(projectPath, 'plugins');
        } else {
            console.warn('[PluginManager] No project path provided, using Global Library as active dir.');
            this.activePluginsDir = this.libraryDir;
        }

        if (!fs.existsSync(this.activePluginsDir)) {
            fs.mkdirSync(this.activePluginsDir, { recursive: true });
        }
        await this.loadAll();
    }

    static getAvailablePlugins(): PluginManifest[] {
        if (!fs.existsSync(this.libraryDir)) return [];

        const results: PluginManifest[] = [];
        try {
            const entries = fs.readdirSync(this.libraryDir, { withFileTypes: true });
            for (const entry of entries) {
                if (!entry.isDirectory()) continue;

                const manifestPath = path.join(this.libraryDir, entry.name, 'manifest.json');
                const pkgPath = path.join(this.libraryDir, entry.name, 'package.json');
                const finalPath = fs.existsSync(manifestPath) ? manifestPath : pkgPath;

                if (fs.existsSync(finalPath)) {
                    try {
                        const content = fs.readFileSync(finalPath, 'utf-8');
                        const json = JSON.parse(content);
                        if (json.id) results.push(json);
                    } catch (e) {
                        console.error(`Invalid manifest in ${entry.name}`, e);
                    }
                }
            }
        } catch (e) {
            console.error('Failed to scan library:', e);
        }
        return results;
    }

    static unloadAll() {
        console.log(`[PluginManager] Unloading ${this.plugins.size} plugins...`);
        //@ts-ignore
        for (const [id, plugin] of this.plugins) {
            if (plugin.registeredItems) {
                // Unregister Nodes
                for (const label of plugin.registeredItems.nodes) {
                    unregisterNodeDefinition(label);
                }
                // Unregister Statements
                /*
                for (const label of plugin.registeredItems.statements) {
                    // Registry.unregisterStatement(label);
                }
                // Unregister Values
                for (const cat of plugin.registeredItems.values) {
                    // Registry.unregisterValue(cat);
                }
                */
            }
        }
        this.plugins.clear();
    }

    static async loadAll() {
        this.unloadAll();

        if (!fs.existsSync(this.activePluginsDir)) return;

        const entries = fs.readdirSync(this.activePluginsDir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                await this.loadPlugin(path.join(this.activePluginsDir, entry.name));
            }
        }
        console.log(`[PluginManager] Loaded ${this.plugins.size} plugins from ${this.activePluginsDir}`);
    }

    static async loadPlugin(dirPath: string) {
        try {
            const manifestPath = path.join(dirPath, 'manifest.json'); // or package.json
            // Support both for now to be nice
            const finalManifestPath = fs.existsSync(manifestPath) ? manifestPath : path.join(dirPath, 'package.json');

            if (!fs.existsSync(finalManifestPath)) {
                console.warn(`[PluginManager] No manifest found in ${dirPath}`);
                return;
            }

            const manifestContent = fs.readFileSync(finalManifestPath, 'utf-8');
            const manifest: PluginManifest = JSON.parse(manifestContent);

            // Validation (Basic)
            if (!manifest.id || !manifest.main) {
                console.error(`[PluginManager] Invalid manifest in ${dirPath}: Missing id or main`);
                return;
            }

            // Load Entry Point
            const entryPath = path.join(dirPath, manifest.main);
            if (!fs.existsSync(entryPath)) {
                console.error(`[PluginManager] Entry point not found: ${entryPath}`);
                return;
            }

            delete window.require.cache[window.require.resolve(entryPath)];
            const pluginModule = window.require(entryPath);

            // Track registered items
            const registeredItems = {
                nodes: [] as string[],
                statements: [] as string[],
                values: [] as string[]
            };

            // Create Context
            const ctx: PluginContext = {
                registerNode: (def) => {
                    this.registerNode(manifest.id, def);
                    registeredItems.nodes.push(def.label);
                },
                registerStatement: (label, _gen) => {
                    // Registry.registerStatement(label, gen);
                    console.warn('[PluginManager] registerStatement not supported in AST compiler yet');
                    registeredItems.statements.push(label);
                },
                registerValue: (cat, _gen) => {
                    // Registry.registerValue(cat, gen);
                    console.warn('[PluginManager] registerValue not supported in AST compiler yet');
                    registeredItems.values.push(cat);
                }
            };

            // Initialize Plugin
            if (typeof pluginModule === 'function') {
                pluginModule(ctx);
            } else if (typeof pluginModule.default === 'function') {
                pluginModule.default(ctx);
            } else {
                console.error(`[PluginManager] Plugin ${manifest.id} entry point does not export a function.`);
                return;
            }

            // Register Runtime Path
            let runtimePath = undefined;
            if (manifest.botm?.runtime) {
                runtimePath = path.join(dirPath, manifest.botm.runtime);
            }

            this.plugins.set(manifest.id, {
                manifest,
                path: dirPath,
                exports: pluginModule,
                runtimePath,
                registeredItems
            });

            console.log(`[PluginManager] Loaded: ${manifest.name} (${manifest.id})`);

        } catch (e) {
            console.error(`[PluginManager] Failed to load plugin at ${dirPath}:`, e);
        }
    }

    static registerNode(_pluginId: string, def: PluginNodeDefinition) {
        const factory = () => this.createDynamicNode(def);

        registerNodeDefinition({
            label: def.label,
            category: def.category,
            factory: factory
        });

        // Register Compiler Logic
        if (def.execute) {
            /*
            Registry.registerStatement(def.label, (node, ctx, processor) => {
                // Determine function name
                const funcName = def.execute!;
                // Generate variable name for the plugin runtime
                const pluginVar = `plugin_${pluginId.replace(/-/g, '_')}`;

                // Result Variable
                const resVar = `res_${node.id.replace(/-/g, '_')}`;

                let argsObj = '{';
                if (def.inputs) {
                    for (const key of Object.keys(def.inputs)) {
                        if (def.inputs[key].type === 'exec') continue; // Flow input

                        const val = processor.resolveInput(node, key, ctx);
                        argsObj += ` ${key}: ${val},`;
                    }
                }
                argsObj += ' }';

                // Return assignment code
                return `        const ${resVar} = await ${pluginVar}.${funcName}(${argsObj});\n`;
            });

            // Register Value Generator for Outputs
            //@ts-ignore
            Registry.registerValue(def.label, (node, outputKey, ctx, resolver) => {
                const resVar = `res_${node.id.replace(/-/g, '_')}`;
                // Outputs from runtime are expected to be properties of the returned object
                return `${resVar}.${outputKey}`;
            });
            */
            console.warn(`[PluginManager] Dynamic node ${def.label} registered but compilation logic is disabled in AST v2.`);
        }
    }

    private static createDynamicNode(def: PluginNodeDefinition): BotNode {
        const node = new BotNode(def.label, def.category);

        // Inputs
        if (def.inputs) {
            for (const [key, conf] of Object.entries(def.inputs)) {
                let socket = Sockets.Any;
                if (conf.type === 'exec') socket = Sockets.Exec;
                else if (conf.type === 'string') socket = Sockets.String;
                else if (conf.type === 'number') socket = Sockets.Number;
                else if (conf.type === 'boolean') socket = Sockets.Boolean;

                node.addInput(key, new ClassicPreset.Input(socket, conf.label || key));

                // Add control if not exec
                if (conf.type !== 'exec') {
                    const typeMap: Record<string, string> = { 'string': 'text', 'number': 'number', 'boolean': 'text' };
                    node.addControl(key, new InputControl(conf.default || '', conf.label || key, typeMap[conf.type] || 'text'));
                }
            }
        }

        // Outputs
        if (def.outputs) {
            for (const [key, conf] of Object.entries(def.outputs)) {
                let socket = Sockets.Any;
                if (conf.type === 'exec') socket = Sockets.Exec;
                else if (conf.type === 'string') socket = Sockets.String;
                else if (conf.type === 'number') socket = Sockets.Number;
                else if (conf.type === 'boolean') socket = Sockets.Boolean;

                node.addOutput(key, new ClassicPreset.Output(socket, conf.label || key));
            }
        }

        return node;
    }
}
