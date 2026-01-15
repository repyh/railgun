import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ForLoopParser implements ASTNodeParser {
    resolveOutput(node: CompilerNode, outputKey: string, _context: ParserContext): AST.Expression | null {
        const shortId = node.id.replace(/-/g, '').substring(0, 8);
        if (outputKey === 'index') {
            return { type: 'Identifier', name: `i_${shortId}` };
        }
        if (outputKey === 'item') {
            return { type: 'Identifier', name: `item_${shortId}` };
        }
        return null;
    }

    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        // Handle Statement Mode (Flow)
        if (mode !== 'statement') return null;

        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        const startExpr = context.resolveInput(node, 'start');
        const endExpr = context.resolveInput(node, 'end');
        const arrayExpr = context.resolveInput(node, 'array');

        const isNumeric = !isNullLiteral(startExpr) || !isNullLiteral(endExpr);

        const shortId = node.id.replace(/-/g, '').substring(0, 8);
        const indexVarName = `i_${shortId}`;
        const itemVarName = `item_${shortId}`;

        const bodyBlock = context.traverseBlock(node, 'body');

        if (isNumeric) {
            // Numeric Loop: for (let i = start; i < end; i++)
            const start = isNullLiteral(startExpr) ? { type: 'Literal', value: 0 } as AST.Literal : startExpr;
            const end = isNullLiteral(endExpr) ? { type: 'Literal', value: 0 } as AST.Literal : endExpr;

            const initDecl: AST.VariableDeclaration = {
                type: 'VariableDeclaration',
                kind: 'let',
                declarations: [{
                    id: { type: 'Identifier', name: indexVarName },
                    init: start
                }]
            };

            const testExpr: AST.BinaryExpression = {
                type: 'BinaryExpression',
                operator: '<',
                left: { type: 'Identifier', name: indexVarName },
                right: end
            };

            const updateExpr: AST.UpdateExpression = {
                type: 'UpdateExpression',
                operator: '++',
                argument: { type: 'Identifier', name: indexVarName },
                prefix: false
            };

            return {
                type: 'ForStatement',
                init: initDecl,
                test: testExpr,
                update: updateExpr,
                body: bodyBlock,
                sourceNodeId: node.id
            } as AST.ForStatement;

        } else {
            // For-Of Loop: for (const item of array)
            const loopVar: AST.VariableDeclaration = {
                type: 'VariableDeclaration',
                kind: 'const',
                declarations: [{
                    id: { type: 'Identifier', name: itemVarName },
                    init: null
                }]
            };

            return {
                type: 'ForOfStatement',
                left: loopVar,
                right: arrayExpr,
                body: bodyBlock,
                await: false,
                sourceNodeId: node.id
            } as AST.ForOfStatement;
        }
    }
}
