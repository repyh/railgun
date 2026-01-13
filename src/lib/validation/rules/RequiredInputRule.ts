import type { ValidationRule } from '../ValidationRule';
import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue } from '../types';

export class RequiredInputRule implements ValidationRule {
    public readonly id = 'required-inputs';

    public validate(nodes: CompilerNode[], connections: CompilerConnection[]): ValidationIssue[] {
        const issues: ValidationIssue[] = [];

        for (const node of nodes) {
            if (node.requiredInputs && node.requiredInputs.size > 0) {
                for (const inputKey of node.requiredInputs) {
                    const isConnected = connections.some(c => c.target === node.id && c.targetInput === inputKey);
                    const controlValue = node.data[inputKey];
                    const hasValue = controlValue !== undefined && controlValue !== null && controlValue.toString().trim() !== '';

                    if (!isConnected && !hasValue) {
                        const msg = node.validationMessages?.get(inputKey) || `Input '${inputKey}' is required.`;

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

            // Custom Node Validation (Method Override)
            if (node.validate) {
                const customIssues = node.validate(connections);
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
}
