import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class WhileLoopParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Statement {
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
