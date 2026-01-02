import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTEventParser } from '../EventParser';
import type { ParserContext } from '../ParserContext';

export class OnReadyParser implements ASTEventParser {
    parse(node: CompilerNode, context: ParserContext): AST.FunctionDeclaration {
        const body = context.traverseBlock(node, 'exec');
        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: context.sanitizeName(node.label || 'OnReady') },
            params: [{ type: 'Identifier', name: 'client' }],
            body,
            async: true,
            sourceNodeId: node.id,
            isEvent: true,
            eventName: 'clientReady'
        };
    }
}
