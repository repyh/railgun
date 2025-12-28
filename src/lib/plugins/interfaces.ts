import type { BotNode } from '../railgun-rete';
import type { StatementGenerator, ValueGenerator } from '../compiler/interfaces';

export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description?: string;
    requirements?: Record<string, string>; // npm dependencies
    botm: {
        runtime?: string; // path to runtime.js
        permissions?: string[];
    };
    main: string; // entry point (index.js)
}

export interface Plugin {
    manifest: PluginManifest;
    path: string;
    exports: any; // The loaded module
    runtimePath?: string; // Absolute path to runtime.js
    registeredItems?: {
        nodes: string[];
        statements: string[];
        values: string[];
    };
}

export interface PluginContext {
    registerNode(definition: PluginNodeDefinition): void;
    registerStatement(label: string, generator: StatementGenerator): void;
    registerValue(categoryOrLabel: string, generator: ValueGenerator): void;
}

export interface PluginNodeDefinition {
    label: string;
    category: string;
    inputs: Record<string, { type: string, label?: string, default?: any }>;
    outputs: Record<string, { type: string, label?: string }>;
    execute?: string; // Name of function in runtime.js
    compile?: (node: BotNode, helper: CompilerHelper) => string;
}

export interface CompilerHelper {
    resolveInput(key: string): string;
    callRuntime(funcName: string, args: string[]): string;
}
