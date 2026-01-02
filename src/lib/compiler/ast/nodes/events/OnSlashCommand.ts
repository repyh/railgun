import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTEventParser } from '../EventParser';
import type { ParserContext } from '../ParserContext';

export class OnSlashCommandParser implements ASTEventParser {
    parse(node: CompilerNode, context: ParserContext): AST.FunctionDeclaration {
        const cmdName = node.data?.name || node.codeType || 'OnSlashCommand';
        const body = context.traverseBlock(node, 'exec');

        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: context.sanitizeName(cmdName) },
            params: [{ type: 'Identifier', name: 'interaction' }],
            body,
            async: true,
            sourceNodeId: node.id,
            isEvent: true,
            eventName: 'interactionCreate'
        };
    }
}
