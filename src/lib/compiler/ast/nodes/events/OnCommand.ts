import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTEventParser } from '../EventParser';
import type { ParserContext } from '../ParserContext';

export class OnCommandParser implements ASTEventParser {
    parse(node: CompilerNode, context: ParserContext): AST.FunctionDeclaration {
        // Name control determines the command name, but for the function ID we use the data.name if available
        const cmdName = node.data?.name || (node.data?.['name']) || 'command';

        const body = context.traverseBlock(node, 'exec');

        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: context.sanitizeName(cmdName) },
            params: [
                { type: 'Identifier', name: 'message' },
                { type: 'Identifier', name: 'args' }
            ],
            body,
            async: true,
            sourceNodeId: node.id,
            isEvent: true,
            eventName: 'messageCreate'
        };
    }
}
