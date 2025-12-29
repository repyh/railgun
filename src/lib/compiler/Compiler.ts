import { BotNode } from '../railgun-rete';
import { PluginManager } from '../plugins/PluginManager';
import { GraphParser } from './ast/GraphParser';
import { CodePrinter } from './ast/CodePrinter';
import * as AST from './ast/types';

/**
 * The Compiler class orchestrates the entire compilation process using the AST Pipeline.
 * 1. GraphParser -> Converts Graph to AST Helper
 * 2. Compiler -> Wraps logic into CommonJS Module Exports
 * 3. CodePrinter -> Generates JS Code
 */
export class Compiler {
    nodes: BotNode[];
    connections: any[];
    imports: Set<string> = new Set();
    parser: GraphParser;
    printer: CodePrinter;

    constructor(data: { nodes: BotNode[], connections: any[] }) {
        this.nodes = data.nodes;
        this.connections = data.connections;
        this.parser = new GraphParser(this.nodes, this.connections);
        this.printer = new CodePrinter();
    }

    /**
     * Adds an import statement to the list of required imports.
     */
    addImport(statement: string) {
        this.imports.add(statement);
    }

    /**
     * Main compile method. Generates the full file content.
     */
    compile(): string {
        // 1. Find the Event Node (Entry Point)
        const eventNode = this.nodes.find(n => n.category === 'Event' || n.codeType === 'On Command' || n.codeType === 'On Slash Command');
        if (!eventNode) {
            throw new Error('No Event node found. A valid graph must have an Event node.');
        }

        const eventLabel = eventNode.codeType || eventNode.label;

        // 2. Inject Plugin Runtimes
        PluginManager.plugins.forEach((plugin: any) => {
            if (plugin.runtimePath) {
                const safePath = plugin.runtimePath.replace(/\\/g, '/');
                const varName = `plugin_${plugin.manifest.id.replace(/-/g, '_')}`;
                this.addImport(`const ${varName} = require("${safePath}");`);
            }
        });

        // 3. Process the Event Logic using GraphParser
        // We bypass the generic tokenizer so we can structure the AST manually around it.
        const bodyBlock = this.parser.traverseBlock(eventNode, 'exec');

        // 4. Construct the wrapper AST based on Event Type
        let program: AST.Program;
        let moduleExportsValue: AST.ObjectExpression;

        if (eventLabel === 'On Slash Command') {
            // --- SLASH COMMAND ---
            this.addImport("const { SlashCommandBuilder } = require('discord.js');");

            moduleExportsValue = {
                type: 'ObjectExpression',
                properties: [
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'data' },
                        value: { type: 'Identifier', name: 'new SlashCommandBuilder().setName("my-command").setDescription("Auto-generated")' } // Simplification for now, usually builder chain
                    },
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'run' },
                        value: {
                            type: 'ArrowFunctionExpression',
                            async: true,
                            params: [
                                { type: 'Identifier', name: 'client' },
                                { type: 'Identifier', name: 'interaction' }
                            ],
                            body: bodyBlock
                        }
                    }
                ]
            };

        } else if (eventLabel === 'On Command') {
            // --- LEGACY COMMAND ---
            const nameControl = eventNode.controls?.['name'] as any;
            const cmdName = nameControl?.value || 'my-cmd';

            moduleExportsValue = {
                type: 'ObjectExpression',
                properties: [
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'name' },
                        value: { type: 'Literal', value: cmdName }
                    },
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'execute' },
                        value: {
                            type: 'ArrowFunctionExpression',
                            async: true,
                            params: [
                                { type: 'Identifier', name: 'message' },
                                { type: 'Identifier', name: 'args' }
                            ],
                            body: bodyBlock
                        }
                    }
                ]
            };

        } else {
            // --- EVENT ---
            let eventName = eventLabel;
            let once = false;
            let argsParams: AST.Identifier[] = [];

            if (eventLabel === 'On Ready') {
                eventName = 'ready';
                once = true;
                argsParams = [{ type: 'Identifier', name: 'client' }];
            } else if (eventLabel === 'On Message Create') {
                eventName = 'messageCreate';
                argsParams = [{ type: 'Identifier', name: 'message' }];
            } else if (eventLabel === 'On Interaction Create' || eventLabel === 'On Button Click' || eventLabel === 'On Modal Submit') {
                eventName = 'interactionCreate';
                argsParams = [{ type: 'Identifier', name: 'interaction' }];
            }

            moduleExportsValue = {
                type: 'ObjectExpression',
                properties: [
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'name' },
                        value: { type: 'Literal', value: eventName }
                    },
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'once' },
                        value: { type: 'Literal', value: once }
                    },
                    {
                        kind: 'init',
                        key: { type: 'Identifier', name: 'execute' },
                        value: {
                            type: 'ArrowFunctionExpression',
                            async: true,
                            params: argsParams,
                            body: bodyBlock
                        }
                    }
                ]
            };
        }

        // 5. Create Program AST
        program = {
            type: 'Program',
            body: [
                {
                    type: 'ExpressionStatement',
                    expression: {
                        type: 'AssignmentExpression',
                        operator: '=',
                        left: {
                            type: 'MemberExpression',
                            object: { type: 'Identifier', name: 'module' },
                            property: { type: 'Identifier', name: 'exports' },
                            computed: false
                        },
                        right: moduleExportsValue
                    }
                }
            ]
        };

        // 6. Generate Code
        let code = this.printer.print(program);

        // 7. Prepend Imports
        let finalCode = '';
        this.imports.forEach(imp => {
            finalCode += imp + '\n';
        });

        finalCode += code;
        return finalCode;
    }
}
