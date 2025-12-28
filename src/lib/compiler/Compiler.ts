import { BotNode } from '../railgun-rete';
import { InputResolver } from './InputResolver';
import { NodeProcessor } from './NodeProcessor';
import { PluginManager } from '../plugins/PluginManager';
import type { CompilerContext } from './interfaces';

/**
 * The Compiler class orchestrates the entire compilation process.
 * It takes a list of nodes and connections, effectively a graph, and converts it into a JavaScript file.
 * It handles:
 * 1. Entry point detection (Event nodes).
 * 2. Plugin runtime injection.
 * 3. Function definition compilation.
 * 4. Main Event compilation (generating the export structure).
 */
export class Compiler {
    nodes: BotNode[];
    connections: any[];
    inputResolver: InputResolver;
    nodeProcessor: NodeProcessor;
    imports: Set<string> = new Set();

    constructor(data: { nodes: BotNode[], connections: any[] }) {
        this.nodes = data.nodes;
        this.connections = data.connections;
        this.inputResolver = new InputResolver(this.nodes, this.connections);
        this.nodeProcessor = new NodeProcessor(this.nodes, this.connections, this.inputResolver);
    }

    /**
     * Adds an import statement to the list of required imports.
     * @param statement Full import entry, e.g. "const fs = require('fs');"
     */
    addImport(statement: string) {
        this.imports.add(statement);
    }

    /**
     * Main compile method. Generates the full file content.
     */
    compile(): string {
        // 1. Find the Event Node (Entry Point)
        const eventNode = this.nodes.find(n => n.category === 'Event');
        if (!eventNode) {
            throw new Error('No Event node found. A valid graph must have an Event node.');
        }

        const eventLabel = eventNode.codeType || eventNode.label;

        // 2. Inject Plugin Runtimes
        PluginManager.plugins.forEach((plugin: any) => {
            if (plugin.runtimePath) {
                // Windows backslashes need escaping or forward slashes
                const safePath = plugin.runtimePath.replace(/\\/g, '/');
                const varName = `plugin_${plugin.manifest.id.replace(/-/g, '_')}`;
                this.addImport(`const ${varName} = require("${safePath}");`);
            }
        });

        // 3. Compile Functions First
        const functionNodes = this.nodes.filter(n => (n.codeType || n.label) === 'Function Def');
        let functionsCode = '';
        for (const fnNode of functionNodes) {
            functionsCode += this.processFunctionNode(fnNode);
        }

        // 4. Determine Output Format based on Event Type
        let code = '';
        const isSlashCommand = eventLabel === 'On Slash Command';

        const ctx: CompilerContext = {
            clientVar: 'client',
            mainVar: 'message', // Default
            interactionVar: 'interaction',
            imports: this.imports,
            addImport: this.addImport.bind(this),
            declaredVariables: new Set()
        };

        if (isSlashCommand) {
            // --- SLASH COMMAND FORMAT ---
            const commandName = 'my-command'; // TODO: Get from graph properties if available

            code += `const { SlashCommandBuilder } = require('discord.js');\n\n`;
            code += functionsCode + '\n';
            code += `module.exports = {\n`;
            code += `    data: new SlashCommandBuilder()\n`;
            code += `        .setName("${commandName}")\n`;
            code += `        .setDescription("Auto-generated command"),\n`;
            code += `    run: async (client, interaction) => {\n`;

            ctx.interactionVar = 'interaction';
            ctx.mainVar = 'interaction';

            code += this.nodeProcessor.process(eventNode, '        ', ctx);
            code += `    }\n`;
            code += `};\n`;

        } else if (eventLabel === 'On Command') {
            // --- LEGACY COMMAND FORMAT ---
            const nameControl = eventNode.controls?.['name'] as any;
            const cmdName = nameControl?.value || 'my-cmd';

            code += functionsCode + '\n';
            code += `module.exports = {\n`;
            code += `    name: '${cmdName}',\n`;
            code += `    execute: async (message, args) => {\n`;
            code += `        const client = message.client;\n`;

            ctx.mainVar = 'message';

            code += this.nodeProcessor.process(eventNode, '        ', ctx);
            code += `    }\n`;
            code += `};\n`;

        } else {
            // --- EVENT FORMAT ---
            let eventName = eventLabel;
            let once = false;
            let args = '...args';

            if (eventLabel === 'On Ready') {
                eventName = 'ready';
                once = true;
                args = 'client';
            } else if (eventLabel === 'On Message Create') {
                eventName = 'messageCreate';
                args = 'message';
            } else if (eventLabel === 'On Interaction Create') {
                eventName = 'interactionCreate';
                args = 'interaction';
            } else if (eventLabel === 'On Modal Submit') {
                eventName = 'interactionCreate';
                args = 'interaction';
            } else if (eventLabel === 'On Button Click') {
                eventName = 'interactionCreate';
                args = 'interaction';
            }

            code += functionsCode + '\n';
            code += `module.exports = {\n`;
            code += `    name: '${eventName}',\n`;
            code += `    once: ${once},\n`;
            code += `    execute: async (${args}) => {\n`;

            if (eventName !== 'ready') {
                code += `        const client = ${args}.client;\n`;
            }

            // Specific Logic filters for Interaction Events
            if (eventLabel === 'On Modal Submit') {
                code += `        if (!${args}.isModalSubmit()) return;\n`;
                const customIdCtrl = eventNode.controls?.['customId'] as any;
                if (customIdCtrl && customIdCtrl.value) {
                    code += `        if (${args}.customId !== '${customIdCtrl.value}') return;\n`;
                }
            } else if (eventLabel === 'On Button Click') {
                code += `        if (!${args}.isButton()) return;\n`;
                const customIdCtrl = eventNode.controls?.['customId'] as any;
                if (customIdCtrl && customIdCtrl.value) {
                    code += `        if (${args}.customId !== '${customIdCtrl.value}') return;\n`;
                }
            }

            ctx.mainVar = args;

            code += this.nodeProcessor.process(eventNode, '        ', ctx);
            code += `    }\n`;
            code += `};\n`;
        }

        // Prepend Imports
        let finalCode = '';
        this.imports.forEach(imp => {
            finalCode += imp + '\n';
        });

        finalCode += code;
        return finalCode;
    }

    /**
     * Processes 'Function Def' nodes which are separate from the main execution flow.
     */
    processFunctionNode(node: BotNode): string {
        const nameControl = node.controls?.['name'] as any;
        const funcName = nameControl?.value || 'myFunc_' + node.id.replace(/-/g, '_');

        // Currently supports up to 3 args, should be made dynamic eventually
        let code = `async function ${funcName}(arg0, arg1, arg2) {\n`;
        code += `    let ret = 0;\n`; // Initialize mutable return variable

        // Find start of execution for this function
        const execOut = this.connections.find(c => c.source === node.id && c.sourceOutput === 'exec');
        if (execOut) {
            const firstNode = this.nodes.find(n => n.id === execOut.target);
            if (firstNode) {
                code += this.nodeProcessor.process(firstNode, '    ', {
                    clientVar: 'client',
                    mainVar: 'arg0',
                    imports: this.imports,
                    addImport: this.addImport.bind(this),
                    declaredVariables: new Set()
                });
            }
        }

        code += `    return ret;\n`;
        code += `}\n`;
        return code;
    }
}
