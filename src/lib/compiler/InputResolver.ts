import { BotNode } from '../railgun-rete';
import { Registry } from './Registry';
import { MathGenerator } from './generators/values/Math';
import { VariableGenerator } from './generators/values/Variable';
import { FunctionGenerator } from './generators/values/Function';
import { DeclareVariableValueGenerator } from './generators/values/DeclareVariable';

// Register Values
Registry.registerValue('Math', MathGenerator);
Registry.registerValue('Variable', VariableGenerator);
Registry.registerValue('Function', FunctionGenerator); // For "Function Def" and "Call Function" output handling

// For specific nodes that might not fit category or need override
Registry.registerValue('Function Def', FunctionGenerator);
Registry.registerValue('Function Def', FunctionGenerator);
Registry.registerValue('Call Function', FunctionGenerator);
Registry.registerValue('Declare Variable', DeclareVariableValueGenerator);

/**
 * The InputResolver is responsible for resolving the value of a node's input.
 * It determines if the input is connected to another node (and requests that node's value),
 * or if it uses a local control value (fallback).
 */
export class InputResolver {

    //@ts-ignore
    constructor(private nodes: BotNode[], private connections: any[]) { }

    /**
     * Resolves an input value to a code string.
     * @param node The target node.
     * @param inputKey The key of the input socket.
     * @param ctx Compiler context.
     * @returns The resolved code representation of the value (e.g. variable name, literal string 'value', or 'undefined').
     */
    resolve(node: BotNode, inputKey: string, ctx: { clientVar: string, mainVar?: string, interactionVar?: string }): string {
        const connection = this.connections.find(c => c.target === node.id && c.targetInput === inputKey);

        // 1. Check for valid connection
        if (connection) {
            const sourceNode = this.nodes.find(n => n.id === connection.source);
            if (!sourceNode) return "undefined";

            // Event Nodes Special Handling (Entry Points)
            if (sourceNode.category === 'Event') {
                const label = sourceNode.codeType || sourceNode.label;
                if (label === 'On Ready' && connection.sourceOutput === 'client') return ctx.clientVar || 'client';
                if (label === 'On Slash Command' && connection.sourceOutput === 'interaction') return ctx.interactionVar || 'interaction';
                if (label === 'On Command') {
                    if (connection.sourceOutput === 'message') return 'message';
                    if (connection.sourceOutput === 'args') return 'args';
                    if (connection.sourceOutput.startsWith('arg_')) {
                        const index = parseInt(connection.sourceOutput.split('_')[1]);
                        return `args[${index}]`;
                    }
                }
            }

            // Delegate to Value Generator
            let generator = Registry.getValueByLabel(sourceNode.codeType || sourceNode.label);
            if (!generator) {
                generator = Registry.getValue(sourceNode.category);
            }

            if (generator) {
                return generator(sourceNode, connection.sourceOutput, ctx, this);
            }

            // Fallback for simple Loop index
            if (sourceNode.label === 'For Loop' && connection.sourceOutput === 'index') return 'i';
        }

        if (node.inputs && node.inputs[inputKey] && node.inputs[inputKey].control) {
            const control = node.inputs[inputKey].control as any;
            if (control.value !== undefined && control.value !== '') return typeof control.value === 'string' ? `'${control.value}'` : control.value;
        }

        if (node.controls && node.controls[inputKey]) {
            const control = node.controls[inputKey] as any;
            if (control.value !== undefined && control.value !== '') {
                if (typeof control.value === 'string') {
                    return `'${control.value.replace(/'/g, "\\'")}'`;
                }
                return control.value;
            }
        }

        if (node.category === 'Math') {
            const sideControl = node.controls?.[inputKey + '_val'] as any;
            if (sideControl && sideControl.value !== undefined) {
                return sideControl.value;
            }
            return '0';
        }

        // Check node.data (standard Rete persistence)
        if (node.data && node.data[inputKey] !== undefined) {
            const val = node.data[inputKey] as any;
            if (val !== undefined && val !== '') {
                return typeof val === 'string' ? `'${val.replace(/'/g, "\\'")}'` : val;
            }
        }

        return 'undefined';
    }
}
