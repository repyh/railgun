import { useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import { ReactFlowAdapter } from '@/lib/adapter/ReactFlowAdapter';
import { GraphValidator } from '@/lib/validation/GraphValidator';
import type { ValidationIssue } from '@/lib/validation/types';

export function useGraphValidator() {
    const validate = useCallback((nodes: Node[], edges: Edge[]): ValidationIssue[] => {
        // 1. Adapter: Convert to Virtual Rete Graph
        const { nodes: reteNodes, connections: reteConnections } = ReactFlowAdapter.toCompilerData(nodes, edges);

        // 2. Validate using existing reliable logic
        const validator = new GraphValidator(reteNodes, reteConnections);
        return validator.validate();
    }, []);

    return { validate };
}
