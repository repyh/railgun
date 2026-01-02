import { useCallback } from 'react';
import { type Connection, type Edge, useReactFlow } from '@xyflow/react';
import { NodeSchemaRegistry } from '@/lib/registries/NodeSchemaRegistry';
import type { BotNodeData } from '@/lib/railgun-flow';

export function useConnectionValidator() {
    const { getNode } = useReactFlow();

    const isValidConnection = useCallback((connection: Connection | Edge) => {
        // 1. No Self Loops
        if (connection.source === connection.target) return false;

        const sourceNode = getNode(connection.source);
        const targetNode = getNode(connection.target);

        if (!sourceNode || !targetNode) return false;

        const sourceData = sourceNode.data as BotNodeData;
        const targetData = targetNode.data as BotNodeData;

        const sourceSchema = NodeSchemaRegistry.get(sourceData._schemaId);
        const targetSchema = NodeSchemaRegistry.get(targetData._schemaId);

        if (!sourceSchema || !targetSchema) return false;

        // 2. Direction Check (Source must be an Output, Target must be an Input)
        // In React Flow, source handles are usually type="source" (outputs)
        // and target handles are type="target" (inputs).
        if (connection.sourceHandle === null || connection.targetHandle === null) return false;

        // 3. Find Socket Types
        // Source implies an Output (from source node)
        const outputSocket = sourceSchema.outputs.find(o => o.key === connection.sourceHandle);
        // Target implies an Input (on target node)
        const inputSocket = targetSchema.inputs.find(i => i.key === connection.targetHandle);

        // Strict validation: Must actually be an output on source and input on target
        if (!outputSocket || !inputSocket) return false;

        // 3. Strict Type Check
        // Exec -> Exec
        if (outputSocket.socketType === 'Exec' && inputSocket.socketType === 'Exec') {
            return true;
        }

        // Data -> Data (Neither is Exec)
        // TODO: Future: Add valueType checking (e.g. String -> String)
        if (outputSocket.socketType !== 'Exec' && inputSocket.socketType !== 'Exec') {
            return true;
        }

        return false;
    }, [getNode]);

    return isValidConnection;
}
