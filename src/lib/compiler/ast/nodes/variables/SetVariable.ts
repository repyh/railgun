import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class SetVariableParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.Statement {
        const varName = context.getNodeValue(node, 'varName');
        const value = context.resolveInput(node, 'value');

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: { type: 'Identifier', name: context.sanitizeName(varName) },
                right: value,
                sourceNodeId: node.id
            },
            sourceNodeId: node.id
        };
    }
}
