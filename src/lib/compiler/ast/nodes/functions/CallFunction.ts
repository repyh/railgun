import type { CompilerNode } from '@/lib/compiler/graphTypes';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class CallFunctionParser implements ASTNodeParser {
    parse(node: CompilerNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        // 1. Resolve Inputs
        // The 'fn' input is crucial. It resolves to the function name (Identifier).
        // If the 'function def' node is connected, resolveInput finds its reference.
        // What does 'resolveInput' return for a FunctionDef node?
        // We will need to implement a 'Referenced Expression' behavior for FunctionDef.

        // Assuming resolveInput returns an Identifier:
        const funcRef = context.resolveInput(node, 'fn');

        // Args
        const args: AST.Expression[] = [];
        args.push(context.resolveInput(node, 'arg0') || { type: 'Literal', value: null });
        args.push(context.resolveInput(node, 'arg1') || { type: 'Literal', value: null });
        args.push(context.resolveInput(node, 'arg2') || { type: 'Literal', value: null });

        // Create the Call Expression
        const callExpr: AST.CallExpression = {
            type: 'CallExpression',
            callee: funcRef,
            arguments: args
        };

        // 2. Return based on requested mode

        if (mode === 'expression') {
            // Used as a value (getting the return value)
            // But 'CallFunction' is an Action node (has Exec flow).
            // This is tricky. In Rete, 'Call Function' is usually a Step.
            // If we use it as a Value, do we execute it? 
            // Yes, generating `myFunc(...)`.
            return callExpr;
        }

        if (mode === 'statement') {
            // Used as a Flow Step
            return {
                type: 'ExpressionStatement',
                expression: callExpr,
                sourceNodeId: node.id
            } as AST.ExpressionStatement;
        }

        return null;
    }
}
