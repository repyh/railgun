import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../types';
import type { ParserContext } from './ParserContext';

export interface ASTNodeParser {
    // Parse the node. Can return a Statement (Flow/Action) or Expression (Value).
    // expectedType allows the parser to return different AST nodes locally if the node is used as a value vs an action.
    parse(node: BotNode, context: ParserContext, expectedType?: 'statement' | 'expression'): AST.Statement | AST.Expression | null;
}
