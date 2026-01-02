import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class DoWhileLoopParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
        const test = context.resolveInput(node, 'condition');
        const body = context.traverseBlock(node, 'loopBody');

        return {
            type: 'DoWhileStatement',
            test: test || { type: 'Literal', value: false }, // Default to false to avoid infinite loops if unconnected
            body: body,
            sourceNodeId: node.id
        };
    }
}
