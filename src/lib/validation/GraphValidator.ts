import type { BotNode } from '@/lib/railgun-rete';
import type { ValidationIssue, GraphValidatorOptions } from './types';

export class GraphValidator {
    private nodes: BotNode[];
    private connections: any[];
    private options: GraphValidatorOptions;

    constructor(nodes: BotNode[], connections: any[], options: GraphValidatorOptions = {}) {
        this.nodes = nodes;
        this.connections = connections;
        this.options = {
            checkCycles: true,
            checkReachability: true,
            checkRequiredInputs: true,
            ...options
        };
    }

    public validate(): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        if (this.options.checkReachability) {
            issues.push(...this.checkReachability());
        }

        if (this.options.checkCycles) {
            issues.push(...this.checkCycles());
        }

        if (this.options.checkRequiredInputs) {
            issues.push(...this.checkRequiredInputs());
        }

        return issues;
    }

    private static readonly EXECUTION_PORT_NAMES = new Set([
        'exec', 'act', 'true', 'false', 'loopBody', 'then', 'else', 'default', 'done', 'body', 'complete', 'exec_out'
    ]);

    /**
     * Finds nodes that are not reachable from any "Entry Point" (Event/Command).
     * Now includes Data Dependency Analysis:
     * 1. Forward Traversal (Execution Flow): Mark nodes reached via Execution Ports.
     * 2. Backward Traversal (Data Flow): Mark nodes that provide data to Reachable nodes.
     */
    private checkReachability(): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        // Generic Entry Point Detection
        const entryNodes = this.nodes.filter(n => this.isEntryNode(n));

        if (entryNodes.length === 0 && this.nodes.length > 0) {
            return [{
                id: 'global-no-entry',
                nodeId: 'global',
                nodeLabel: 'Global',
                severity: 'warning',
                message: 'No Entry Points found (Event, Command, or Function Def). This bot will do nothing.',
                ruleId: 'no-entry-point'
            }];
        }

        const reachableSet = new Set<string>();
        const executionQueue: string[] = entryNodes.map(n => n.id);

        // Phase 1: Forward Traversal (Execution Flow)
        entryNodes.forEach(n => reachableSet.add(n.id));

        while (executionQueue.length > 0) {
            const currentId = executionQueue.shift()!;

            // Find valid execution outputs
            const outgoingConnections = this.connections.filter(c =>
                c.source === currentId &&
                GraphValidator.EXECUTION_PORT_NAMES.has(c.sourceOutput)
            );

            for (const conn of outgoingConnections) {
                if (!reachableSet.has(conn.target)) {
                    reachableSet.add(conn.target);
                    executionQueue.push(conn.target);
                }
            }
        }

        // Phase 2: Backward Traversal (Data Dependencies)
        // Any node connected to a Reachable node via a non-execution port is also Reachable (it's a dependency).
        // we use a Queue to propagate simpler: "If A is Reachable, and B provides data to A, B is Reachable."
        const dataQueue: string[] = Array.from(reachableSet);

        while (dataQueue.length > 0) {
            const currentId = dataQueue.shift()!;

            // Find INCOMING connections to this node
            const incomingConnections = this.connections.filter(c => c.target === currentId);

            for (const conn of incomingConnections) {
                // If this connection is NOT an execution flow (it's data), mark source as reachable
                // Execution flows are: Source(Exec) -> Target(Exec). 
                // We typically check the Source Output name to determine connection type.
                if (!GraphValidator.EXECUTION_PORT_NAMES.has(conn.sourceOutput)) {
                    if (!reachableSet.has(conn.source)) {
                        reachableSet.add(conn.source);
                        dataQueue.push(conn.source); // Propagate backwards: if B is needed, B's dependencies are needed
                    }
                }
            }
        }

        // Identify unreachable nodes
        for (const node of this.nodes) {
            if (!reachableSet.has(node.id)) {
                // If a node has no input execution ports, it's a data node or entry point.
                // We skip "unreachable" warnings for these as they are either the root
                // or are intended to be "reachable" by data reference rather than control flow.
                const inputKeys = Object.keys(node.inputs || {});
                const hasExecutionInput = inputKeys.some(key => GraphValidator.EXECUTION_PORT_NAMES.has(key));

                if (!hasExecutionInput) continue;

                issues.push({
                    id: `${node.id}-unreachable`,
                    nodeId: node.id,
                    nodeLabel: node.label,
                    severity: 'warning',
                    message: 'This node is unreachable from any Event or Command.',
                    ruleId: 'unreachable-code'
                });
            }
        }

        return issues;
    }

    /**
     * Detects cycles in the execution flow using Iterative DFS (Stack-safe).
     * Distinguishes between "Crash Loops" (Synchronous) and "Async Loops" (Valid, e.g. with Wait).
     */
    private checkCycles(): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        // Helper to check if a node causes a yield/delay (making a loop safe)
        const isAsyncNode = (nodeId: string) => {
            const node = this.nodes.find(n => n.id === nodeId);
            if (!node) return false;
            // Check for known async labels
            return ['Wait', 'Wait for Interaction'].includes(node.label);
        };

        const entryNodes = this.nodes.filter(n => this.isEntryNode(n));

        // Iterative DFS
        for (const entryNode of entryNodes) {
            if (visited.has(entryNode.id)) continue;

            const stack: { nodeId: string; parentId: string | null; children: string[]; childIndex: number }[] = [];

            // Push entry
            stack.push({
                nodeId: entryNode.id,
                parentId: null,
                children: this.getExecutionChildren(entryNode.id),
                childIndex: 0
            });
            visited.add(entryNode.id);
            recursionStack.add(entryNode.id);

            while (stack.length > 0) {
                const currentFn = stack[stack.length - 1]; // Peek
                const { nodeId, children, childIndex } = currentFn;

                if (childIndex < children.length) {
                    const childId = children[childIndex];
                    currentFn.childIndex++; // Move to next child for next pass

                    if (recursionStack.has(childId)) {
                        // CYCLE DETECTED

                        // Reconstruct path to check for async nodes
                        // Path is roughly the stack + childId
                        const cyclePathIds = stack.map(s => s.nodeId);
                        // Filter path to only include the "loop" part? 
                        // The childId is somewhere up the stack.
                        const loopStartIndex = cyclePathIds.indexOf(childId);
                        const loopNodes = loopStartIndex !== -1 ? cyclePathIds.slice(loopStartIndex) : cyclePathIds;

                        const hasAsync = loopNodes.some(id => isAsyncNode(id));

                        issues.push({
                            id: `${nodeId}-cycle`,
                            nodeId: nodeId,
                            nodeLabel: this.nodes.find(n => n.id === nodeId)?.label || 'Unknown',
                            severity: hasAsync ? 'warning' : 'error',
                            message: hasAsync
                                ? 'Async Cycle detected. This loop contains a Wait/Delay, so it will not crash, but ensure it has an exit condition.'
                                : 'Synchronous Cycle detected. This causes an infinite loop and will CRASH the bot.',
                            ruleId: 'cycle-detected'
                        });

                        // Don't traverse this child again to avoid infinite warnings for same cycle
                        continue;
                    }

                    if (!visited.has(childId)) {
                        visited.add(childId);
                        recursionStack.add(childId);
                        stack.push({
                            nodeId: childId,
                            parentId: nodeId,
                            children: this.getExecutionChildren(childId),
                            childIndex: 0
                        });
                    }
                } else {
                    // All children processed, pop
                    recursionStack.delete(nodeId);
                    stack.pop();
                }
            }
        }

        return issues;
    }

    private getExecutionChildren(nodeId: string): string[] {
        return this.connections
            .filter(c => c.source === nodeId && GraphValidator.EXECUTION_PORT_NAMES.has(c.sourceOutput))
            .map(c => c.target);
    }

    /**
     * Checks if required inputs are connected or have values.
     * Uses decentralized metadata from BotNode.
     */
    private checkRequiredInputs(): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        for (const node of this.nodes) {
            // 1. Check Standard Required Inputs (Metadata)
            if (node.requiredInputs && node.requiredInputs.size > 0) {
                for (const inputKey of node.requiredInputs) {
                    const isConnected = this.connections.some(c => c.target === node.id && c.targetInput === inputKey);
                    // Check standard control value if not connected (for value types)
                    // @ts-ignore
                    const controlValue = node.controls?.[inputKey]?.value;
                    const hasValue = controlValue && controlValue.toString().trim() !== '';

                    if (!isConnected && !hasValue) {
                        // Some inputs like 'member' don't have controls, so they MUST be connected.
                        const msg = node.validationMessages.get(inputKey) || `Input '${inputKey}' is required.`;

                        issues.push({
                            id: `${node.id}-req-${inputKey}`,
                            nodeId: node.id,
                            nodeLabel: node.label,
                            severity: 'warning',
                            message: msg,
                            ruleId: 'missing-input'
                        });
                    }
                }
            }

            // 2. Custom Node Validation (Method Override)
            if (node.validate) {
                const customIssues = node.validate(this.connections);
                if (customIssues && customIssues.length > 0) {
                    issues.push(...customIssues.map(i => ({
                        ...i,
                        nodeId: node.id,
                        nodeLabel: node.label,
                        ruleId: 'custom-validation'
                    })));
                }
            }
        }

        return issues;
    }

    private isEntryNode(node: BotNode): boolean {
        const inputNames = Object.keys(node.inputs || {});
        const hasExecInput = inputNames.some(name => GraphValidator.EXECUTION_PORT_NAMES.has(name));

        const outputNames = Object.keys(node.outputs || {});
        const hasExecOutput = outputNames.some(name => GraphValidator.EXECUTION_PORT_NAMES.has(name));

        return !hasExecInput && hasExecOutput;
    }
}
