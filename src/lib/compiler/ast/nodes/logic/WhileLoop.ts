import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class WhileLoopParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
        const test = context.resolveInput(node, 'condition');
        const body = context.traverseBlock(node, 'loopBody');

        return {
            type: 'WhileStatement',
            test,
            body,
            sourceNodeId: node.id
        };
    }
}
