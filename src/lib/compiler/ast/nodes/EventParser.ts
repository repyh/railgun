import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../types';
import type { ParserContext } from './ParserContext';

export interface ASTEventParser {
    parse(node: CompilerNode, context: ParserContext): AST.FunctionDeclaration | null;
}
