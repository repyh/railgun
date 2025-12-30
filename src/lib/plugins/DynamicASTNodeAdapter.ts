import type { ASTNodeParser } from '../compiler/ast/nodes/NodeParser';
import type { ParserContext } from '../compiler/ast/nodes/ParserContext';
import * as AST from '../compiler/ast/types';
import type { BotNode } from '../railgun-rete';
import type { PluginNodeDefinition } from './interfaces';

export class DynamicASTNodeAdapter implements ASTNodeParser {
    private pluginId: string;
    private def: PluginNodeDefinition;

    constructor(
        pluginId: string,
        def: PluginNodeDefinition
    ) {
        this.pluginId = pluginId;
        this.def = def;
    }

    parse(node: BotNode, context: ParserContext, expectedType?: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (!this.def.execute) {
            return {
                type: 'CommentStatement',
                text: `Plugin Node ${this.def.label} (ID: ${node.id}) has no execute function defined.`
            };
        }

        // Mark plugin as used so the compiler injects the require statement
        context.markPluginUsed(this.pluginId);

        // 1. Generate Arguments Object
        const properties: AST.Property[] = [];

        if (this.def.inputs) {
            for (const key of Object.keys(this.def.inputs)) {
                // Skip flow inputs
                if (this.def.inputs[key].type === 'exec') continue;

                const valExpr = context.resolveInput(node, key);
                properties.push({
                    key: { type: 'Identifier', name: key },
                    value: valExpr,
                    kind: 'init'
                });
            }
        }

        // 2. Build Call Expression to runtime
        // We assume the runtime is exposed via a global or imported variable. 
        // For now, let's assume `plugins.pluginId.funcName(args)` or similar.
        // Actually, looking at implementation plan: `plugin_pluginId.funcName(args)`

        const safePluginId = this.pluginId.replace(/[^a-zA-Z0-9_]/g, '_');
        const pluginVarName = `plugin_${safePluginId}`;

        const callExpr: AST.CallExpression = {
            type: 'CallExpression',
            callee: {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: pluginVarName },
                property: { type: 'Identifier', name: this.def.execute },
                computed: false
            },
            arguments: [
                {
                    type: 'ObjectExpression',
                    properties: properties
                }
            ]
        };

        // 3. Return based on expected type
        if (expectedType === 'statement') {
            // Check if it has outputs other than exec. If so, it might yield a value.
            // But if requested as statement, we wrap in ExpressionStatement.
            // If it returns a value, we might want to capture it? 
            // For now, simple expression statement.

            // If the plugin node is supposed to be "await"ed? 
            // Most plugin ops (I/O) should probably be awaited.

            const awaitExpr: AST.AwaitExpression = {
                type: 'AwaitExpression',
                argument: callExpr
            };

            // If we have outputs (that are not flow), we might need to assign the result to a temp variable
            // so subsequent nodes can access it via resolveInput -> resolveOutput logic.
            const hasDataOutputs = this.def.outputs && Object.values(this.def.outputs).some(o => o.type !== 'exec');

            if (hasDataOutputs) {
                // let res_NODEID = await ...
                const resultVar = `res_${node.id.replace(/-/g, '_')}`;
                return {
                    type: 'VariableDeclaration',
                    kind: 'const',
                    declarations: [
                        {
                            id: { type: 'Identifier', name: resultVar },
                            init: awaitExpr
                        }
                    ]
                };
            }

            return {
                type: 'ExpressionStatement',
                expression: awaitExpr
            };
        } else {
            // expected 'expression'. 
            // Usually means this node is being pulled as an input for another node.
            // We return the VARIABLE that holds the result, assuming it was executed in flow.
            // OR, if this is a purely functional node (no side effects, no flow input), we return the call itself?

            // If the node HAS 'exec' input, it MUST proceed via flow (Statement).
            // Referring to it as an value means referring to its Result Variable.

            const hasExecInput = this.def.inputs && Object.values(this.def.inputs).some(i => i.type === 'exec');
            if (hasExecInput) {
                const resultVar = `res_${node.id.replace(/-/g, '_')}`;
                // Return member access if specific output key passed? 
                // The parse() method doesn't know which output key is requested.
                // resolveOutput does. 

                // If parse() is called in expression mode for a Flow node, it's ambiguous.
                // Usually resolveInput -> processValueNode -> resolveOutput (custom) OR parse(..., 'expression').

                // If we return just the variable identifier, it assumes the whole object.
                return { type: 'Identifier', name: resultVar };
            } else {
                // Pure value node. Inline the call.
                // e.g. Math, String Utils.
                // Since these are likely async in the plugin system (everything is async there usually?), 
                // we wrap in Await? But we can't await in non-async places easily.
                // Assuming plugin runtime functions are async.

                return {
                    type: 'AwaitExpression',
                    argument: callExpr
                };
            }
        }
    }

    resolveOutput(node: BotNode, outputKey: string, context: ParserContext): AST.Expression | null {
        // If this is a flow node, the result is stored in res_NODEID.
        // We probably need to return `res_NODEID.outputKey`.

        const hasExecInput = this.def.inputs && Object.values(this.def.inputs).some(i => i.type === 'exec');

        if (hasExecInput) {
            const resultVar = `res_${node.id.replace(/-/g, '_')}`;
            return {
                type: 'MemberExpression',
                object: { type: 'Identifier', name: resultVar },
                property: { type: 'Identifier', name: outputKey },
                computed: false
            };
        }

        // If it's a value node (no flow), parse() returns the AwaitExpression(Call).
        // If we want a specific property of that result...
        // We can't easily append .property to an AwaitExpression in all AST specs without parentheses.
        // (await call()).prop

        // AST.MemberExpression supports object as any Expression.

        // Re-call parse to get the call expr
        const callExpr = this.parse(node, context, 'expression') as AST.Expression | null;
        if (!callExpr) return null;

        return {
            type: 'MemberExpression',
            object: callExpr,
            property: { type: 'Identifier', name: outputKey },
            computed: false
        };
    }
}
