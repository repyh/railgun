import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../types';
import type { ParserContext } from './ParserContext';

export interface ASTEventParser {
    parse(node: BotNode, context: ParserContext): AST.FunctionDeclaration | null;
}
