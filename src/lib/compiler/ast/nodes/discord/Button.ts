import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ButtonParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'expression') return null;

        const label = context.resolveInput(node, 'label');
        const customId = context.resolveInput(node, 'customId');
        const styleInput = context.resolveInput(node, 'style');
        const emoji = context.resolveInput(node, 'emoji');

        const properties: AST.Property[] = [];

        properties.push({
            key: { type: 'Identifier', name: 'type' },
            value: { type: 'Literal', value: 2 }, // 2 = Button component
            kind: 'init'
        });

        properties.push({
            key: { type: 'Identifier', name: 'label' },
            value: label,
            kind: 'init'
        });

        // Handle Style mapping if literal
        let styleExpr = styleInput;
        if (styleInput.type === 'Literal' && typeof styleInput.value === 'string') {
            const styles: Record<string, number> = {
                'Primary': 1,
                'Secondary': 2,
                'Success': 3,
                'Danger': 4,
                'Link': 5
            };
            const val = styles[styleInput.value] || 1;
            styleExpr = { type: 'Literal', value: val };
        }

        properties.push({
            key: { type: 'Identifier', name: 'style' },
            value: styleExpr,
            kind: 'init'
        });

        // Custom ID is required unless it's a Link style (not fully implemented here)
        if (styleInput.type === 'Literal' && styleInput.value === 'Link') {
            // Link style uses URL instead of custom_id
            // Not yet supported in the node inputs
        } else {
            properties.push({
                key: { type: 'Identifier', name: 'custom_id' },
                value: customId,
                kind: 'init'
            });
        }

        if (emoji.type !== 'Literal' || emoji.value !== null) {
            properties.push({
                key: { type: 'Identifier', name: 'emoji' },
                value: emoji,
                kind: 'init'
            });
        }

        return {
            type: 'ObjectExpression',
            properties,
            sourceNodeId: node.id
        };
    }
}
