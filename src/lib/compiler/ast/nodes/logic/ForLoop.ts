import type { BotNode } from '../../../../railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class ForLoopParser implements ASTNodeParser {
    parse(node: BotNode, context: ParserContext): AST.ForOfStatement {
        const arrayExpr = context.resolveInput(node, 'array');

        // Variable Name input from user control? Or implicit?
        // Usually Rete node has 'item' output which acts as the variable.
        // We need to DECLARE this variable in the loop head.
        // Or if the user connects the 'item' output to something, we need a name for it.
        // Let's assume the user enters a variable name or we generate one.
        // Ideally: `const item_NODEID of array`

        // But if downstream nodes use "Get Variable", they expect a specific name.
        // Or Rete handles scope?
        // For simplicity: `const item = ...` is standard.
        // Start simple: use `item` or `element` if not specified.
        // Let's use `const item_${node.id}` to avoid collisions.
        const varName = `item_${node.id.replace(/-/g, '_')}`;

        // IMPORTANT: We must register this variable in the context scope if we were tracking scope.
        // Since we don't have deep scope tracking yet, downstream nodes might not know how to access it
        // unless they use `item_${node.id}`?
        // In Rete, typically the "Loop" node has an output called "Item".
        // When downstream nodes connect to "Item", `resolveInput` follows the connection back to "Loop".
        // We need to handle this in `GraphParser.resolveInput`. 
        // IF a node connects to Loop's "Item" output, `processValueNode` should return Identifier `item_...`.

        // But `ForLoopParser` is a STATEMENT parser.
        // `processValueNode` handles EXPRESSIONS.
        // We need to register this parser for BOTH?
        // Or the Registry should map "Loop" -> ForLoopParser (Statement) AND "Loop" -> LoopValueParser (Expression)?
        // Currently Registry maps 1:1.

        // TEMPORARY SOLUTION:
        // Use a fixed name `item`? No, collisions.
        // We assume `GraphParser` handles variable reference resolution if we implemented "Data" flows correctly.
        // Note: `GraphParser.processValueNode` currently calls `registry.getParser`.
        // If we implement `parse(..., 'expression')` in THIS class, we can return the Identifier!

        const bodyBlock = context.traverseBlock(node, 'loopBody'); // Output 'loopBody' or 'exec'? Usually separate flow.

        const loopVar: AST.VariableDeclaration = {
            type: 'VariableDeclaration',
            kind: 'const',
            declarations: [{
                id: { type: 'Identifier', name: varName },
                init: null
            }]
        };

        return {
            type: 'ForOfStatement',
            left: loopVar,
            right: arrayExpr,
            body: bodyBlock,
            await: false, // Optional: support 'for await' via checkbox?
            sourceNodeId: node.id
        };
    }
}
