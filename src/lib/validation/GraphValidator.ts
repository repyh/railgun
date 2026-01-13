import type { CompilerNode, CompilerConnection } from '@/lib/compiler/graphTypes';
import type { ValidationIssue, GraphValidatorOptions } from './types';
import { validationRegistry } from './ValidationRegistry';
import { ReachabilityRule } from './rules/ReachabilityRule';
import { CycleDetectionRule } from './rules/CycleDetectionRule';
import { RequiredInputRule } from './rules/RequiredInputRule';

/**
 * Main validator class that orchestrates graph validation rules.
 * Uses a registration-based system for extensibility.
 */
export class GraphValidator {
    private nodes: CompilerNode[];
    private connections: CompilerConnection[];
    private options: GraphValidatorOptions;

    constructor(nodes: CompilerNode[], connections: CompilerConnection[], options: GraphValidatorOptions = {}) {
        this.nodes = nodes;
        this.connections = connections;
        this.options = {
            checkCycles: true,
            checkReachability: true,
            checkRequiredInputs: true,
            ...options
        };

        // Ensure core rules are registered
        // In a real plugin system, this might be handled via a global init
        this.initializeRules();
    }

    private initializeRules() {
        if (this.options.checkReachability) {
            validationRegistry.register(new ReachabilityRule());
        }
        if (this.options.checkCycles) {
            validationRegistry.register(new CycleDetectionRule());
        }
        if (this.options.checkRequiredInputs) {
            validationRegistry.register(new RequiredInputRule());
        }
    }

    /**
     * Executes all registered validation rules.
     */
    public validate(): ValidationIssue[] {
        return validationRegistry.runAll(this.nodes, this.connections);
    }
}
