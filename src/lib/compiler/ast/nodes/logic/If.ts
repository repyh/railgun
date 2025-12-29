import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class IfParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Statement {
        const test = context.resolveInput(node, 'condition');
        const consequent = context.traverseBlock(node, 'true');
        const alternate = context.traverseBlock(node, 'false');

        return {
            type: 'IfStatement',
            test,
            consequent,
            alternate: alternate.body.length > 0 ? alternate : null,
            sourceNodeId: node.id
        };
    }
}
