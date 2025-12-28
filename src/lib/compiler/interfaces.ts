import type { BotNode } from '../railgun-rete';

/**
 * Context passed around during compilation.
 * Holds references to global variable names and import sets.
 */
export interface CompilerContext {
    /** Name of the discord.js Client variable (e.g. 'client') */
    clientVar: string;
    /** Name of the main module variable if applicable */
    mainVar?: string;
    /** Name of the interaction variable (e.g. 'interaction') */
    interactionVar?: string;
    /** Set of required imports to be added to the file header */
    imports?: Set<string>;
    /** Helper to add an import string */
    addImport?: (statement: string) => void;
    /** Set of declared variable names to prevent re-declaration */
    declaredVariables?: Set<string>;
}

/**
 * Interface for the main NodeProcessor which orchestrates compilation.
 * Generators use this to process child nodes or inspect the graph.
 */
export interface Processor {
    process(node: BotNode, indent: string, ctx: CompilerContext): string;
    getConnections(): any[];
    findConnection(nodeId: string, key: string, type?: 'in' | 'out'): any;
    getNode(nodeId: string): BotNode | undefined;
    resolveInput(node: BotNode, key: string, ctx: any): string;
}

/**
 * Interface for the InputResolver.
 * Generators use this to resolve values from input sockets.
 */
export interface Resolver {
    resolve(node: BotNode, key: string, ctx: any): string;
}

/**
 * A function that generates code for a specific "Statement" node (Action, Logic, etc.).
 * Returns a block of code (potentially multiple lines).
 */
export type StatementGenerator = (node: BotNode, ctx: CompilerContext, processor: Processor) => string;

/**
 * A function that generates code for a "Value" node (Variable, Math, Data).
 * Returns a single expression string (e.g. "myVar", "5 + 10").
 */
export type ValueGenerator = (node: BotNode, outputKey: string, ctx: CompilerContext, resolver: Resolver) => string;
