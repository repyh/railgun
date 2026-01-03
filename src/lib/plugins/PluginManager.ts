import type { Plugin, PluginContext, PluginManifest, PluginNodeDefinition } from './interfaces';
import { registry as ASTRegistry } from '../compiler/ast/nodes/index';
import { DynamicASTNodeAdapter } from './DynamicASTNodeAdapter';
import { NodeSchemaRegistry } from '../registries/NodeSchemaRegistry';
import type { NodeSchema, NodeControl } from '../railgun-flow';

// Environment detection
const isRenderer = typeof globalThis !== 'undefined' && !!(globalThis as any).window;

// Use a dynamic require to avoid bundler issues in renderer process
const getModule = (id: string) => {
    const globalObj = globalThis as any;
    if (isRenderer && globalObj.window?.require) {
        return globalObj.window.require(id);
    }
    // @ts-ignore - 'require' exists in Electron main process
    return typeof require !== 'undefined' ? require(id) : undefined;
};

const fs = getModule('fs');
const path = getModule('path');
const electron = getModule('electron');
const app = isRenderer ? getModule('@electron/remote')?.app : electron?.app;

export class PluginManager {
    static plugins: Map<string, Plugin> = new Map();
    static libraryDir = app ? path.join(app.getPath('documents'), 'railgun', 'plugins') : '';
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

    static getRuntimePath(pluginId: string): string | undefined {
        const plugin = this.plugins.get(pluginId);
        return plugin?.runtimePath;
    }

    static getManifest(pluginId: string): PluginManifest | undefined {
        return this.plugins.get(pluginId)?.manifest;
    }

    static unloadAll() {
        console.log(`[PluginManager] Unloading ${this.plugins.size} plugins...`);
        for (const [, plugin] of this.plugins) {
            if (plugin.registeredItems) {
                // Unregister Nodes from Schema Registry
                for (const schemaId of plugin.registeredItems.nodes) {
                    NodeSchemaRegistry.unregister(schemaId);
                }
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

            // Strict ID Validation: alphanumeric, dash, underscore only
            if (!/^[a-zA-Z0-9\-_]+$/.test(manifest.id)) {
                console.error(`[PluginManager] Invalid plugin ID "${manifest.id}" in ${dirPath}. Only alphanumeric, dashes, and underscores are allowed.`);
                return;
            }

            // Load Entry Point
            const entryPath = path.join(dirPath, manifest.main);
            if (!fs.existsSync(entryPath)) {
                console.error(`[PluginManager] Entry point not found: ${entryPath}`);
                return;
            }

            const globalObj = globalThis as any;
            const safeRequire = (isRenderer && globalObj.window?.require) ? globalObj.window.require : require;
            delete safeRequire.cache[safeRequire.resolve(entryPath)];
            const pluginModule = safeRequire(entryPath);

            // Track registered items
            const registeredItems = {
                nodes: [] as string[],
                statements: [] as string[],
                values: [] as string[]
            };

            // Create Context
            const ctx: PluginContext = {
                registerNode: (def) => {
                    const schemaId = this.registerNode(manifest.id, def);
                    registeredItems.nodes.push(schemaId);
                },
                registerStatement: (_label, _gen) => {
                    // Registry.registerStatement(label, gen);
                    console.warn('[PluginManager] registerStatement not supported in AST compiler yet');
                    registeredItems.statements.push(_label);
                },
                registerValue: (_cat, _gen) => {
                    // Registry.registerValue(cat, gen);
                    console.warn('[PluginManager] registerValue not supported in AST compiler yet');
                    registeredItems.values.push(_cat);
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

    static registerNode(pluginId: string, def: PluginNodeDefinition): string {
        const schemaId = `plugin/${pluginId}/${def.label.replace(/\s+/g, '-').toLowerCase()}`;
        // Create NodeSchema from Plugin Definition
        const schema: NodeSchema = {
            id: schemaId,
            label: def.label,
            category: def.category,
            inputs: [],
            outputs: [],
            controls: []
        };

        // Map Inputs
        if (def.inputs) {
            Object.entries(def.inputs).forEach(([key, conf]) => {
                let socketType = 'Any';

                // Map legacy types to new socket types
                if (conf.type === 'exec') socketType = 'Exec';
                else if (conf.type === 'string') socketType = 'String';
                else if (conf.type === 'number') socketType = 'Number';
                else if (conf.type === 'boolean') socketType = 'Boolean';
                else socketType = 'Any'; // Default

                schema.inputs.push({
                    key,
                    label: conf.label || key,
                    socketType
                });

                // Generate Control if primitive type and not exec
                // This allows plugin nodes to have editable properties
                if (conf.type !== 'exec') {
                    // Infer control type
                    let controlType: NodeControl['type'] = 'text';
                    if (conf.type === 'number') controlType = 'number';
                    if (conf.type === 'boolean') controlType = 'boolean';

                    schema.controls.push({
                        key,
                        type: controlType,
                        label: conf.label || key,
                        props: {
                            placeholder: conf.default ? String(conf.default) : undefined
                        }
                    });
                    // Set default data
                    if (!schema.defaultData) schema.defaultData = {};
                    if (conf.default !== undefined) {
                        schema.defaultData[key] = conf.default;
                    }
                }
            });
        }

        // Map Outputs
        if (def.outputs) {
            Object.entries(def.outputs).forEach(([key, conf]) => {
                let socketType = 'Any';

                // Map legacy types
                if (conf.type === 'exec') socketType = 'Exec';
                else if (conf.type === 'string') socketType = 'String';
                else if (conf.type === 'number') socketType = 'Number';
                else if (conf.type === 'boolean') socketType = 'Boolean';
                else socketType = 'Any'; // Default

                schema.outputs.push({
                    key,
                    label: conf.label || key,
                    socketType
                });
            });
        }

        // Register Schema
        NodeSchemaRegistry.register(schema);

        // Register AST Parser Logic
        if (def.execute) {
            const adapter = new DynamicASTNodeAdapter(pluginId, def);
            ASTRegistry.register(def.label, adapter);
            console.log(`[PluginManager] Registered AST Adapter for ${def.label}`);
        } else {
            console.warn(`[PluginManager] Node ${def.label} has no execute function, AST generation will emit comments.`);
        }

        return schemaId;
    }
}
