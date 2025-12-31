import type { BotNode } from '../../../../railgun-rete';
import * as AST from '../../types';
import type { ASTEventParser } from '../EventParser';
import type { ParserContext } from '../ParserContext';

export class OnSlashCommandParser implements ASTEventParser {
    parse(node: BotNode, context: ParserContext): AST.FunctionDeclaration {
        const body = context.traverseBlock(node, 'exec');
        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: context.sanitizeName(node.label || 'OnSlashCommand') },
            params: [{ type: 'Identifier', name: 'interaction' }],
            body,
            async: true,
            sourceNodeId: node.id,
            isEvent: true,
            eventName: 'interactionCreate'
        };
    }
}
