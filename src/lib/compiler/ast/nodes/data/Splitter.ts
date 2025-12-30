import type { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class SplitterParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression' = 'expression'): AST.Expression | null {
        if (mode === 'statement') return null;

        const inputStr = context.resolveInput(node, 'string') || { type: 'Literal', value: '' };
        const separator = context.getNodeValue(node, 'separator') || ','; // Default to comma

        return {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: inputStr,
                property: { type: 'Identifier', name: 'split' },
                computed: false
            },
            arguments: [
                { type: 'Literal', value: separator }
            ],
            optional: false,
            sourceNodeId: node.id
        } as AST.CallExpression;
    }
}
