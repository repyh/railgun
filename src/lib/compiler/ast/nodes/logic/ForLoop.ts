import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ForLoopParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        const isNullLiteral = (expr: AST.Expression) => expr.type === 'Literal' && expr.value === null;

        const startExpr = context.resolveInput(node, 'start'); // 'Start Index' -> 'start'
        const endExpr = context.resolveInput(node, 'end');     // 'End Index' -> 'end'
        const arrayExpr = context.resolveInput(node, 'array');

        // Heuristic: If start or end are provided (not null), it's a Numeric Loop.
        const isNumeric = !isNullLiteral(startExpr) || !isNullLiteral(endExpr);

        // Deterministic variable names based on node ID
        const indexVarName = `i_${node.id.replace(/-/g, '_')}`;
        const itemVarName = `item_${node.id.replace(/-/g, '_')}`;

        // 1. Handle Expression Mode (downstream node asks for "index" or "item")
        if (mode === 'expression') {
            // Depending on loop type, return the appropriate identifier
            // Note: We don't know WHICH output socket was requested here easily unless we passed outputKey?
            // But usually 'For Loop' exposes 'index' (numeric) or 'item' (foreach).
            // A numeric loop might expose 'index'. A foreach might expose 'item' AND 'index'.
            // For now, let's return the primary variable.
            // TODO: If we want to support 'index' specifically from foreach, we need outputKey context.
            // Assuming the requested value corresponds to the loop variable:
            if (isNumeric) {
                return { type: 'Identifier', name: indexVarName };
            } else {
                return { type: 'Identifier', name: itemVarName }; // The item
            }
        }

        // 2. Handle Statement Mode (Flow)
        if (mode !== 'statement') return null;

        const bodyBlock = context.traverseBlock(node, 'loopBody');

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
