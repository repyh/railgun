import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue } from './types';

/**
 * Interface for building modular validation rules.
 * Each rule is responsible for a single aspect of graph integrity.
 */
export interface ValidationRule {
    /** Unique identifier for the rule */
    readonly id: string;

    /**
     * Executes the validation logic.
     * @param nodes The flattened compiler nodes.
     * @param connections The connections between nodes.
     * @returns An array of issues found, or an empty array if valid.
     */
    validate(nodes: CompilerNode[], connections: CompilerConnection[]): ValidationIssue[];
}
