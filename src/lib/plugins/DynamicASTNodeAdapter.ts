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
            // But if requested as statement, wrap in ExpressionStatement.

            const awaitExpr: AST.AwaitExpression = {
                type: 'AwaitExpression',
                argument: callExpr
            };

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
            const hasExecInput = this.def.inputs && Object.values(this.def.inputs).some(i => i.type === 'exec');
            if (hasExecInput) {
                const resultVar = `res_${node.id.replace(/-/g, '_')}`;
                return { type: 'Identifier', name: resultVar };
            } else {
                return {
                    type: 'AwaitExpression',
                    argument: callExpr
                };
            }
        }
    }

    resolveOutput(node: BotNode, outputKey: string, context: ParserContext): AST.Expression | null {
        // Prepare the base object expression
        let baseObject: AST.Expression;

        const hasExecInput = this.def.inputs && Object.values(this.def.inputs).some(i => i.type === 'exec');

        if (hasExecInput) {
            // Flow node result variable
            const resultVar = `res_${node.id.replace(/-/g, '_')}`;
            baseObject = { type: 'Identifier', name: resultVar };
        } else {
            // Value node (inline execution)
            // Re-call parse to get the call expr
            const callExpr = this.parse(node, context, 'expression') as AST.Expression | null;
            if (!callExpr) return null;
            baseObject = callExpr;
        }

        return this.createMemberAccess(baseObject, outputKey);
    }

    /**
     * Helper to create nested MemberExpressions from a dot-notation path.
     * Handles invalid identifiers by using computed properties (obj["key-name"]).
     */
    private createMemberAccess(base: AST.Expression, path: string): AST.Expression {
        const parts = path.split('.');
        let currentExpr = base;

        for (const part of parts) {
            const isValidId = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part);

            if (isValidId) {
                currentExpr = {
                    type: 'MemberExpression',
                    object: currentExpr,
                    property: { type: 'Identifier', name: part },
                    computed: false
                };
            } else {
                currentExpr = {
                    type: 'MemberExpression',
                    object: currentExpr,
                    property: { type: 'Literal', value: part, raw: `'${part}'` },
                    computed: true
                };
            }
        }

        return currentExpr;
    }
}
