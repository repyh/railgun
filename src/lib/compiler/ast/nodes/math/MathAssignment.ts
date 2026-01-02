import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class MathAssignmentParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
        // LHS: Variable
        let varName = context.getNodeValue(node, 'varName');
        const variableInput = context.resolveInput(node, 'variable');
        if (variableInput && variableInput.type === 'Identifier') {
            varName = variableInput.name;
        }

        // RHS: Value
        const value = context.resolveInput(node, 'value') || { type: 'Literal', value: 1 };

        // Operator
        const opControl = context.getNodeValue(node, 'operator') || 'Add'; // Add, Subtract, Multiply, Divide
        let operator = '+=';
        switch (opControl) {
            case 'Subtract': operator = '-='; break;
            case 'Multiply': operator = '*='; break;
            case 'Divide': operator = '/='; break;
            case 'Add':
            default:
                operator = '+='; break;
        }

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: operator as AST.AssignmentOperator,
                left: { type: 'Identifier', name: context.sanitizeName(varName) },
                right: value,
                sourceNodeId: node.id
            },
            sourceNodeId: node.id
        };
    }
}
