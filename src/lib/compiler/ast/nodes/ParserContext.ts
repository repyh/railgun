import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../types';

export interface ParserContext {
    // Resolve an input socket to an Expression (recursive)
    resolveInput(node: CompilerNode, key: string): AST.Expression;

    // Get a control/data value directly
    getNodeValue(node: CompilerNode, key: string): any;

    // Traverse a flow output (e.g. 'exec', 'true', 'loopBody') returning a Block
    traverseBlock(node: CompilerNode, outputKey: string): AST.BlockStatement;

    // Helper to sanitize names (keep consistent with main parser)
    sanitizeName(name: string): string;

    // Track used plugins for import generation
    markPluginUsed(pluginId: string): void;
}
