import { useCallback, useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';

interface HistoryState {
    nodes: Node[];
    edges: Edge[];
}

export function useUndoRedo() {
    const { getNodes, getEdges, setNodes, setEdges } = useReactFlow();
    const [past, setPast] = useState<HistoryState[]>([]);
    const [future, setFuture] = useState<HistoryState[]>([]);

    // We use a ref to store the current state for reference when taking snapshots
    const currentState = useRef<HistoryState>({ nodes: [], edges: [] });

    const canUndo = past.length > 0;
    const canRedo = future.length > 0;

    const takeSnapshot = useCallback(() => {
        const nodes = getNodes();
        const edges = getEdges();
        const newState = {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges))
        };

        // Compare with current state to avoid duplicate snapshots
        if (currentState.current) {
            // Optimization: check if string representation matches
            if (JSON.stringify(currentState.current) === JSON.stringify(newState)) return;
        }

        setPast((prev) => [...prev.slice(-49), currentState.current]); // Keep last 50
        setFuture([]);
        currentState.current = newState;
    }, [getNodes, getEdges]);

    const undo = useCallback(() => {
        if (!canUndo) return;

        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);

        setFuture((prev) => [currentState.current, ...prev]);
        setPast(newPast);

        currentState.current = previous;
        // setNodes and setEdges in React Flow v12 will trigger the relevant changes
        setNodes(JSON.parse(JSON.stringify(previous.nodes)));
        setEdges(JSON.parse(JSON.stringify(previous.edges)));
    }, [past, canUndo, setNodes, setEdges]);

    const redo = useCallback(() => {
        if (!canRedo) return;

        const next = future[0];
        const newFuture = future.slice(1);

        setPast((prev) => [...prev, currentState.current]);
        setFuture(newFuture);

        currentState.current = next;
        setNodes(JSON.parse(JSON.stringify(next.nodes)));
        setEdges(JSON.parse(JSON.stringify(next.edges)));
    }, [future, canRedo, setNodes, setEdges]);

    // Initial state setter - critical for the first change to have something to revert to
    const setInitialState = useCallback((nodes: Node[], edges: Edge[]) => {
        currentState.current = {
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges))
        };
        setPast([]);
        setFuture([]);
    }, []);

    return {
        undo,
        redo,
        takeSnapshot,
        canUndo,
        canRedo,
        setInitialState
    };
}
