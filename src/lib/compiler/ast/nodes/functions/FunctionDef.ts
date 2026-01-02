import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class FunctionDefParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        const name = context.getNodeValue(node, 'name') || `func_${node.id.replace(/-/g, '_')}`;
        const cleanName = context.sanitizeName ? context.sanitizeName(name) : name.replace(/[^a-zA-Z0-9_]/g, '_');

        if (mode === 'expression') {
            // Return the function name as an identifier reference
            return { type: 'Identifier', name: cleanName };
        }

        // Arguments (Fixed to 3 for now based on node def)
        const params: AST.Identifier[] = [];
        // We need to know if these args are used.
        // Similar to 'Event' args, we just declare them.
        params.push({ type: 'Identifier', name: 'arg0' });
        params.push({ type: 'Identifier', name: 'arg1' });
        params.push({ type: 'Identifier', name: 'arg2' });

        const bodyBlock = context.traverseBlock(node, 'exec');

        return {
            type: 'FunctionDeclaration',
            id: { type: 'Identifier', name: cleanName },
            params: params,
            body: bodyBlock,
            async: true, // Async by default for bot actions
            sourceNodeId: node.id
        } as AST.FunctionDeclaration;
    }

    resolveOutput(_node: CompilerNode, outputKey: string, _context: ParserContext): AST.Expression | null {
        // Handle Argument Outputs
        if (outputKey.startsWith('arg')) {
            // e.g. "arg0" -> "arg0"
            // The FunctionDefParser generates params named "arg0", "arg1"...
            return { type: 'Identifier', name: outputKey };
        }

        // Return null to allow fallback to standard `parse(..., 'expression')`
        // which returns the function reference (Identifier)
        return null;
    }
}
