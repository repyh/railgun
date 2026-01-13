import type { ValidationRule } from '../ValidationRule';
import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue } from '../types';

export class CycleDetectionRule implements ValidationRule {
    public readonly id = 'cycle-detection';

    private static readonly EXECUTION_PORT_NAMES = new Set([
        'exec', 'act', 'true', 'false', 'loopBody', 'then', 'else', 'default', 'done', 'body', 'complete', 'exec_out'
    ]);

    public validate(nodes: CompilerNode[], connections: CompilerConnection[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const isAsyncNode = (nodeId: string) => {
            const node = nodes.find(n => n.id === nodeId);
            return node ? ['Wait', 'Wait for Interaction'].includes(node.label) : false;
        };

        const entryNodes = nodes.filter(n => this.isEntryNode(n));

        for (const entryNode of entryNodes) {
            if (visited.has(entryNode.id)) continue;

            const stack: { nodeId: string; children: string[]; childIndex: number }[] = [{
                nodeId: entryNode.id,
                children: this.getExecutionChildren(entryNode.id, connections),
                childIndex: 0
            }];

            visited.add(entryNode.id);
            recursionStack.add(entryNode.id);

            while (stack.length > 0) {
                const current = stack[stack.length - 1];

                if (current.childIndex < current.children.length) {
                    const childId = current.children[current.childIndex];
                    current.childIndex++;

                    if (recursionStack.has(childId)) {
                        const cyclePath = stack.map(s => s.nodeId);
                        const loopStart = cyclePath.indexOf(childId);
                        const loopNodes = loopStart !== -1 ? cyclePath.slice(loopStart) : cyclePath;
                        const hasAsync = loopNodes.some(id => isAsyncNode(id));

                        issues.push({
                            id: `${current.nodeId}-cycle`,
                            nodeId: current.nodeId,
                            nodeLabel: nodes.find(n => n.id === current.nodeId)?.label || 'Unknown',
                            severity: hasAsync ? 'warning' : 'error',
                            message: hasAsync
                                ? 'Async Cycle detected. Loop contains a delay, but ensure it has an exit condition.'
                                : 'Synchronous Cycle detected. This causes an infinite loop and will CRASH the bot.',
                            ruleId: 'cycle-detected'
                        });
                        continue;
                    }

                    if (!visited.has(childId)) {
                        visited.add(childId);
                        recursionStack.add(childId);
                        stack.push({
                            nodeId: childId,
                            children: this.getExecutionChildren(childId, connections),
                            childIndex: 0
                        });
                    }
                } else {
                    recursionStack.delete(current.nodeId);
                    stack.pop();
                }
            }
        }

        return issues;
    }

    private getExecutionChildren(nodeId: string, connections: CompilerConnection[]): string[] {
        return connections
            .filter(c => c.source === nodeId && CycleDetectionRule.EXECUTION_PORT_NAMES.has(c.sourceOutput))
            .map(c => c.target);
    }

    private isEntryNode(node: CompilerNode): boolean {
        const inputNames = Object.keys(node.inputs || {});
        const hasExecInput = inputNames.some(name => CycleDetectionRule.EXECUTION_PORT_NAMES.has(name));
        const outputNames = Object.keys(node.outputs || {});
        const hasExecOutput = outputNames.some(name => CycleDetectionRule.EXECUTION_PORT_NAMES.has(name));
        return !hasExecInput && hasExecOutput;
    }
}
