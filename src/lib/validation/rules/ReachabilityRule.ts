import type { ValidationRule } from '../ValidationRule';
import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue } from '../types';

export class ReachabilityRule implements ValidationRule {
    public readonly id = 'reachability';

    private static readonly EXECUTION_PORT_NAMES = new Set([
        'exec', 'act', 'true', 'false', 'loopBody', 'then', 'else', 'default', 'done', 'body', 'complete', 'exec_out'
    ]);

    public validate(nodes: CompilerNode[], connections: CompilerConnection[]): ValidationIssue[] {
        if (nodes.length === 0) return [];

        const issues: ValidationIssue[] = [];
        const entryNodes = nodes.filter(n => this.isEntryNode(n));

        if (entryNodes.length === 0) {
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
        const queue: string[] = entryNodes.map(n => n.id);
        entryNodes.forEach(n => reachableSet.add(n.id));

        // Phase 1: Forward Traversal (Execution Flow)
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            const outgoing = connections.filter(c =>
                c.source === currentId &&
                ReachabilityRule.EXECUTION_PORT_NAMES.has(c.sourceOutput)
            );

            for (const conn of outgoing) {
                if (!reachableSet.has(conn.target)) {
                    reachableSet.add(conn.target);
                    queue.push(conn.target);
                }
            }
        }

        // Phase 2: Backward Traversal (Data Dependencies)
        const dataQueue: string[] = Array.from(reachableSet);
        while (dataQueue.length > 0) {
            const currentId = dataQueue.shift()!;
            const incoming = connections.filter(c => c.target === currentId);

            for (const conn of incoming) {
                if (!ReachabilityRule.EXECUTION_PORT_NAMES.has(conn.sourceOutput)) {
                    if (!reachableSet.has(conn.source)) {
                        reachableSet.add(conn.source);
                        dataQueue.push(conn.source);
                    }
                }
            }
        }

        // Phase 3: Identify Unreachable
        for (const node of nodes) {
            if (!reachableSet.has(node.id)) {
                const inputKeys = Object.keys(node.inputs || {});
                const hasExecutionInput = inputKeys.some(key => ReachabilityRule.EXECUTION_PORT_NAMES.has(key));

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

    private isEntryNode(node: CompilerNode): boolean {
        const inputNames = Object.keys(node.inputs || {});
        const hasExecInput = inputNames.some(name => ReachabilityRule.EXECUTION_PORT_NAMES.has(name));
        const outputNames = Object.keys(node.outputs || {});
        const hasExecOutput = outputNames.some(name => ReachabilityRule.EXECUTION_PORT_NAMES.has(name));
        return !hasExecInput && hasExecOutput;
    }
}
