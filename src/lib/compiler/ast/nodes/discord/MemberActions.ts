import { BotNode } from '@/lib/railgun-rete';
import * as AST from '../../types';
import type { ASTNodeParser } from '../NodeParser';
import type { ParserContext } from '../ParserContext';

export class MemberActionParser implements ASTNodeParser {
    private action: 'kick' | 'ban' | 'addRole' | 'removeRole';

    constructor(action: 'kick' | 'ban' | 'addRole' | 'removeRole') {
        this.action = action;
    }

    parse(node: BotNode, context: ParserContext, mode: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (mode !== 'statement') return null;

        const member = context.resolveInput(node, 'member');
        const args: AST.Expression[] = [];

        if (this.action === 'kick' || this.action === 'ban') {
            const reason = context.resolveInput(node, 'reason');
            const optionsProps: AST.Property[] = [];

            if (reason.type !== 'Literal' || reason.value !== null) {
                optionsProps.push({
                    key: { type: 'Identifier', name: 'reason' },
                    value: reason,
                    kind: 'init'
                });
            }

            if (this.action === 'ban') {
                const deleteDays = context.resolveInput(node, 'deleteDays');
                if (deleteDays.type !== 'Literal' || deleteDays.value !== null) {
                    optionsProps.push({
                        key: { type: 'Identifier', name: 'deleteMessageSeconds' },
                        // discord.js uses seconds now, Rete node has days (let's assume simple multiplier for now or just pass through)
                        value: {
                            type: 'BinaryExpression',
                            operator: '*',
                            left: deleteDays,
                            right: { type: 'Literal', value: 86400 } // Days to seconds
                        },
                        kind: 'init'
                    });
                }
            }

            if (optionsProps.length > 0) {
                args.push({ type: 'ObjectExpression', properties: optionsProps });
            }
        } else if (this.action === 'addRole' || this.action === 'removeRole') {
            const role = context.resolveInput(node, 'role');
            args.push(role);
        }

        // member.kick(reason) or member.roles.add(role)
        let callee: AST.Expression;

        if (this.action === 'addRole' || this.action === 'removeRole') {
            callee = {
                type: 'MemberExpression',
                object: {
                    type: 'MemberExpression',
                    object: member,
                    property: { type: 'Identifier', name: 'roles' },
                    computed: false,
                    optional: true
                },
                property: { type: 'Identifier', name: this.action === 'addRole' ? 'add' : 'remove' },
                computed: false,
                optional: true
            };
        } else {
            callee = {
                type: 'MemberExpression',
                object: member,
                property: { type: 'Identifier', name: this.action },
                computed: false,
                optional: true
            };
        }

        return {
            type: 'ExpressionStatement',
            expression: {
                type: 'CallExpression',
                callee,
                arguments: args,
                optional: true
            },
            sourceNodeId: node.id
        };
    }
}
