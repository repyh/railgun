import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class IncrementParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext): AST.Statement {
        // Resolve variable name (similar to SetVariable)
        let varName = context.getNodeValue(node, 'varName');
        const variableInput = context.resolveInput(node, 'variable');

        if (variableInput && variableInput.type === 'Identifier') {
            varName = variableInput.name;
        }

        const cleanName = context.sanitizeName(varName);

        // Determine operator (Increment or Decrement)
        // Usually dependent on a control or dropdown. 
        // Assuming 'mode' control: 'Increment' (++) or 'Decrement' (--)
        const mode = context.getNodeValue(node, 'mode') || 'Increment';
        const operator = mode === 'Decrement' ? '--' : '++';

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'UpdateExpression',
                operator: operator,
                argument: { type: 'Identifier', name: cleanName },
                prefix: false, // var++
                sourceNodeId: node.id
            },
            sourceNodeId: node.id
        };
    }
}
