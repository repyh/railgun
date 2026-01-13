import type { CompilerNode } from '../compiler/graphTypes';
// import type { StatementGenerator, ValueGenerator } from '../compiler/interfaces';

export interface PluginViewDefinition {
    id: string;
    label: string;
    icon?: string; // Lucide icon name or URL
    target: 'sidebar' | 'bottom-panel'; // Where the view is mounted
}

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
    views?: PluginViewDefinition[]; // New: Declarative views
}

/**
 * The Railgun Bridge API
 * This object is injected into the plugin's mount function.
 */
export interface RailgunBridge {
    workspace: {
        projectPath: string;
        readFile(path: string): Promise<string>;
        writeFile(path: string, content: string): Promise<void>;
        listFiles(dir?: string): Promise<string[]>;
    };
    compiler: {
        build(): Promise<{ success: boolean; message: string }>;
        getLatestBuildLog(): string[];
    };
    terminal: {
        write(data: string): void;
        writeLine(data: string): void;
        execute(command: string): void;
    };
    ui: {
        showNotification(type: 'info' | 'warn' | 'error', message: string): void;
        setStatusBar(text: string): void;
    };
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
        views: string[]; // New: Track registered views
    };
}

export interface PluginContext {
    registerNode(definition: PluginNodeDefinition): void;
    /** @deprecated specific to legacy transpiler. Use registerNode with 'execute' property for AST support. */
    registerStatement(label: string, generator: any): void;
    /** @deprecated specific to legacy transpiler. Use registerNode with 'execute' property for AST support. */
    registerValue(categoryOrLabel: string, generator: any): void;
    /**
     * Registers a mount function for a declarative view defined in manifest.json
     */
    registerView(viewId: string, mounter: (el: HTMLElement, api: RailgunBridge) => void | (() => void)): void;
}

export interface PluginNodeDefinition {
    label: string;
    category: string;
    inputs: Record<string, { type: string, label?: string, default?: any }>;
    outputs: Record<string, { type: string, label?: string }>;
    execute?: string; // Name of function in runtime.js
    compile?: (node: CompilerNode, helper: CompilerHelper) => string;
}

export interface CompilerHelper {
    resolveInput(key: string): string;
    callRuntime(funcName: string, args: string[]): string;
}
