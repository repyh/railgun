import { BotNode } from '../../../railgun-rete';
import * as AST from '../types';
import { GraphParser } from '../GraphParser';

export interface NodeParser {
    parse(node: BotNode, parser: GraphParser, context: 'statement' | 'expression'): AST.Statement | AST.Expression | null;
}
