import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../types';
import type { ParserContext } from './ParserContext';

export interface ASTNodeParser {
    // Parse the node. Can return a Statement (Flow/Action) or Expression (Value).
    // expectedType allows the parser to return different AST nodes locally if the node is used as a value vs an action.
    parse(node: BotNode, context: ParserContext, expectedType?: 'statement' | 'expression'): AST.Statement | AST.Expression | null;

    /**
     * Optional: valid custom logic for resolving a specific output check.
     * Use this if your node has multiple semantic outputs (e.g. "Value" vs "Index", or "Ref" vs "Args").
     * Returns null to fallback to standard 'expression' parsing.
     */
    resolveOutput?(node: BotNode, outputKey: string, context: ParserContext): AST.Expression | null;
}
