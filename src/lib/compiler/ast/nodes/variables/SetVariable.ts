import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class SetVariableParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
        let varName = context.getNodeValue(node, 'varName');
        const variableInput = context.resolveInput(node, 'variable'); // Try resolving 'variable' input

        // If input is an Identifier (e.g. from Declare Variable), use it
        if (variableInput && variableInput.type === 'Identifier') {
            varName = variableInput.name;
        }

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
