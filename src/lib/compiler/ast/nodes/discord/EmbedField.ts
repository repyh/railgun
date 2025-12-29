import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class EmbedFieldParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression' = 'expression'): AST.Expression | null {
        // Embed Field is strictly an expression (Value node) used by Construct Embed
        if (mode === 'statement') return null;

        const name = context.resolveInput(node, 'name') || { type: 'Literal', value: context.getNodeValue(node, 'fieldName') || 'Title' };
        const value = context.resolveInput(node, 'value') || { type: 'Literal', value: context.getNodeValue(node, 'fieldValue') || 'Value' };
        const inlineRaw = context.getNodeValue(node, 'inline');
        const inline = { type: 'Literal', value: inlineRaw === true || inlineRaw === 'true' };

        return {
            type: 'ObjectExpression',
            properties: [
                {
                    type: 'Property',
                    key: { type: 'Identifier', name: 'name' },
                    value: name,
                    kind: 'init'
                },
                {
                    type: 'Property',
                    key: { type: 'Identifier', name: 'value' },
                    value: value,
                    kind: 'init'
                },
                {
                    type: 'Property',
                    key: { type: 'Identifier', name: 'inline' },
                    value: inline as AST.Literal,
                    kind: 'init'
                }
            ],
            sourceNodeId: node.id
        } as AST.ObjectExpression;
    }
}
