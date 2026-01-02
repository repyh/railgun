import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class LogicOpParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Expression {
        let left = context.resolveInput(node, 'inp1');
        if (left.type === 'Literal' && left.value === null) {
            left = context.resolveInput(node, 'a');
        }

        let right = context.resolveInput(node, 'inp2');
        if (right.type === 'Literal' && right.value === null) {
            right = context.resolveInput(node, 'b');
        }

        let opValue = context.getNodeValue(node, 'optim') || context.getNodeValue(node, 'operator') || 'And';

        const opMap: Record<string, '&&' | '||' | '??'> = {
            'And': '&&',
            'Or': '||',
            'Nullish': '??',
            '&&': '&&',
            '||': '||',
            '??': '??'
        };

        const op = opMap[opValue] || '&&';

        return {
            type: 'LogicalExpression',
            operator: op,
            left: left || { type: 'Literal', value: null },
            right: right || { type: 'Literal', value: null },
            sourceNodeId: node.id
        } as AST.LogicalExpression;
    }
}
