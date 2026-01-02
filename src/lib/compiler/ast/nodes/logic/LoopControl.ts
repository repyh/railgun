import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class BreakParser implements ASTNodeParser {
    parse(node: CompilerNode, _context: ParserContext): AST.BreakStatement {
        return {
            type: 'BreakStatement',
            sourceNodeId: node.id
        };
    }
}

export class ContinueParser implements ASTNodeParser {
    parse(node: CompilerNode, _context: ParserContext): AST.ContinueStatement {
        return {
            type: 'ContinueStatement',
            sourceNodeId: node.id
        };
    }
}
