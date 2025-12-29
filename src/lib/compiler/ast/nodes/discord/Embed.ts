import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class EmbedParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'expression') return null;

        const properties: AST.Property[] = [];

        const addProp = (key: string, valueExpr: AST.Expression) => {
            properties.push({
                key: { type: 'Identifier', name: key },
                value: valueExpr,
                kind: 'init'
            });
        };

        const title = context.resolveInput(node, 'title');
        const description = context.resolveInput(node, 'description');
        const color = context.resolveInput(node, 'color');
        const author = context.resolveInput(node, 'author');
        const image = context.resolveInput(node, 'image');
        const thumbnail = context.resolveInput(node, 'thumbnail');
        const footer = context.resolveInput(node, 'footer');
        const fields = context.resolveInput(node, 'fields');

        // Logic to only add if not null/undefined literal
        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        if (!isNullLiteral(title)) addProp('title', title);
        if (!isNullLiteral(description)) addProp('description', description);

        if (!isNullLiteral(color)) {
            addProp('color', color);
        }

        if (!isNullLiteral(author)) {
            addProp('author', {
                type: 'ObjectExpression',
                properties: [{
                    key: { type: 'Identifier', name: 'name' },
                    value: author,
                    kind: 'init'
                }]
            });
        }

        if (!isNullLiteral(image)) {
            addProp('image', {
                type: 'ObjectExpression',
                properties: [{
                    key: { type: 'Identifier', name: 'url' },
                    value: image,
                    kind: 'init'
                }]
            });
        }

        if (!isNullLiteral(thumbnail)) {
            addProp('thumbnail', {
                type: 'ObjectExpression',
                properties: [{
                    key: { type: 'Identifier', name: 'url' },
                    value: thumbnail,
                    kind: 'init'
                }]
            });
        }

        if (!isNullLiteral(footer)) {
            addProp('footer', {
                type: 'ObjectExpression',
                properties: [{
                    key: { type: 'Identifier', name: 'text' },
                    value: footer,
                    kind: 'init'
                }]
            });
        }

        if (!isNullLiteral(fields)) {
            addProp('fields', fields);
        }

        return {
            type: 'ObjectExpression',
            properties,
            sourceNodeId: node.id
        };
    }
}
