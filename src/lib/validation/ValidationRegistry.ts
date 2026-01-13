import type { ValidationRule } from './ValidationRule';
import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue } from './types';

class ValidationRegistry {
    private static instance: ValidationRegistry;
    private rules: Map<string, ValidationRule> = new Map();

    private constructor() { }

    public static getInstance(): ValidationRegistry {
        if (!ValidationRegistry.instance) {
            ValidationRegistry.instance = new ValidationRegistry();
        }
        return ValidationRegistry.instance;
    }

    /**
     * Registers a new validation rule.
     */
    public register(rule: ValidationRule): void {
        this.rules.set(rule.id, rule);
    }

    /**
     * Unregisters a validation rule.
     */
    public unregister(ruleId: string): void {
        this.rules.delete(ruleId);
    }

    /**
     * Runs all registered rules against the graph.
     */
    public runAll(nodes: CompilerNode[], connections: CompilerConnection[]): ValidationIssue[] {
        const allIssues: ValidationIssue[] = [];
        for (const rule of this.rules.values()) {
            try {
                const issues = rule.validate(nodes, connections);
                allIssues.push(...issues);
            } catch (error) {
                console.error(`Validation rule [${rule.id}] failed:`, error);
                allIssues.push({
                    id: `rule-error-${rule.id}`,
                    nodeId: 'global',
                    nodeLabel: 'Validator',
                    severity: 'error',
                    message: `Internal error in validation rule: ${rule.id}`,
                    ruleId: 'validator-internal-error'
                });
            }
        }
        return allIssues;
    }
}

export const validationRegistry = ValidationRegistry.getInstance();
export { ValidationRegistry };
