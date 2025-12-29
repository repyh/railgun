import type { BotNode } from '../../../../railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class SendMessageParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.ExpressionStatement {
        const target = context.resolveInput(node, 'channel') as AST.Expression;
        const content = context.resolveInput(node, 'content');

        // Handling logic:
        // Default target to 'message.channel' or 'interaction.channel' if not provided?
        // Logic: if 'channel' input is null, assume context based?
        // But usually Send Message has a required input.
        // For now, let's assume it's like 'message.reply' or 'channel.send'.

        // If content is just a literal, wrap in { content: ... }?
        // Discord.js v14+ expects { content: string } or string? string is deprecated for some methods vs interaction.reply.

        // Simplified generation: target.send(content)

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: target,
                    property: { type: 'Identifier', name: 'send' },
                    computed: false
                },
                arguments: [content]
            },
            sourceNodeId: node.id
        };
    }
}
