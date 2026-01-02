import type { Node, Edge } from '@xyflow/react';
import type { BotNodeData } from '@/lib/railgun-flow';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { CompilerNode, CompilerConnection, CompilerInput, CompilerOutput } from '@/lib/compiler/graphTypes';

export class ReactFlowAdapter {
    static toCompilerNode(rfNode: Node): CompilerNode | null {
        const data = rfNode.data as BotNodeData;
        const schemaId = data._schemaId;
        const schema = NodeSchemaRegistry.get(schemaId);

        if (!schema) {
            // "Unknown" schema - silently skip if it's explicitly unknown to avoid spam
            if (schemaId !== 'unknown') {
                console.warn(`[ReactFlowAdapter] Unknown schema for node ${rfNode.id}: ${schemaId}`);
            }
            return null;
        }

        // Map Data
        const nodeData = { ...data };

        // Construct Inputs
        const inputs: Record<string, CompilerInput> = {};
        if (schema.inputs) {
            for (const input of schema.inputs) {
                inputs[input.key] = {
                    socket: { name: input.socketType },
                    label: input.label
                };
            }
        }

        // Construct Outputs
        const outputs: Record<string, CompilerOutput> = {};
        if (schema.outputs) {
            for (const output of schema.outputs) {
                outputs[output.key] = {
                    socket: { name: output.socketType },
                    label: output.label
                };
            }
        }

        // Required Inputs & Validation Metadata
        const requiredInputs = new Set<string>();
        const validationMessages = new Map<string, string>();
        if (schema.inputs) {
            for (const input of schema.inputs) {
                if (input.required) {
                    requiredInputs.add(input.key);
                    if (input.validationMessage) {
                        validationMessages.set(input.key, input.validationMessage);
                    }
                }
            }
        }

        return {
            id: rfNode.id,
            label: schema.label,
            category: schema.category || 'Action',
            codeType: schema.label, // Use label as codeType for legacy compiler naming compatibility
            data: nodeData,
            inputs,
            outputs,
            requiredInputs,
            validationMessages
            // Custom validate() method from Classes is lost in Schema migration, which is expected.
        };
    }

    static toCompilerData(nodes: Node[], edges: Edge[]) {
        const compilerNodes: CompilerNode[] = [];
        const compilerConnections: CompilerConnection[] = [];

        // 1. Convert Nodes
        for (const rfNode of nodes) {
            const node = this.toCompilerNode(rfNode);
            if (node) compilerNodes.push(node);
        }

        // 2. Convert Edges
        for (const edge of edges) {
            compilerConnections.push({
                id: edge.id,
                source: edge.source,
                sourceOutput: edge.sourceHandle || 'exec', // Default to exec if null
                target: edge.target,
                targetInput: edge.targetHandle || 'exec'
            });
        }

        return {
            nodes: compilerNodes,
            connections: compilerConnections
        };
    }
}
