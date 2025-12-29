import type { NodeParser } from './NodeParser';
import { BotNode } from '../../../railgun-rete';
import { GraphParser } from '../GraphParser';
import * as AST from '../types';

export class VariableParser implements NodeParser {
    parse(node: BotNode, parser: GraphParser, context: 'statement' | 'expression'): AST.Statement | AST.Expression | null {

        // --- Declarations ---
        if (node.label === 'Declare Variable') {
            const varName = parser.getNodeValue(node, 'varName');

            if (context === 'statement') {
                // Statement: VariableDeclaration
                const initValue = parser.resolveInput(node, 'value');
                return {
                    type: 'VariableDeclaration',
                    kind: 'let',
                    declarations: [{
                        id: { type: 'Identifier', name: parser.sanitizeName(varName) },
                        init: initValue
                    }],
                    sourceNodeId: node.id
                } as AST.VariableDeclaration;
            } else {
                // Expression: Identifier (Reference)
                return {
                    type: 'Identifier',
                    name: parser.sanitizeName(varName),
                    sourceNodeId: node.id
                } as AST.Identifier;
            }
        }

        // --- Assignments ---
        // Set Variable, Math Assignment, Increment
        if (['Set Variable', 'Math Assignment', 'Increment'].includes(node.label)) {
            let left: AST.Identifier;
            let right: AST.Expression;
            let op: any = '=';

            if (node.label === 'Set Variable') {
                const varName = parser.getNodeValue(node, 'varName');
                left = { type: 'Identifier', name: parser.sanitizeName(varName) };
                right = parser.resolveInput(node, 'value');
                op = '=';
            } else if (node.label === 'Math Assignment') {
                const varNameInput = parser.resolveInput(node, 'variable');
                let varName = 'unknown_var';
                if (varNameInput.type === 'Literal' && typeof varNameInput.value === 'string') {
                    varName = varNameInput.value;
                } else if (varNameInput.type === 'Identifier') {
                    varName = varNameInput.name;
                }
                left = { type: 'Identifier', name: parser.sanitizeName(varName) };
                right = parser.resolveInput(node, 'value');
                op = parser.getNodeValue(node, 'op') || '+=';
            } else { // Increment
                const varNameInput = parser.resolveInput(node, 'variable');
                let varName = 'unknown_var';
                if (varNameInput.type === 'Literal' && typeof varNameInput.value === 'string') {
                    varName = varNameInput.value;
                }
                left = { type: 'Identifier', name: parser.sanitizeName(varName) };
                const rawOp = parser.getNodeValue(node, 'op') || '++';
                op = rawOp === '++' ? '+=' : '-=';
                right = { type: 'Literal', value: 1 };
            }

            const assignment: AST.AssignmentExpression = {
                type: 'AssignmentExpression',
                operator: op,
                left: left,
                right: right,
                sourceNodeId: node.id
            };

            if (context === 'statement') {
                return {
                    type: 'ExpressionStatement',
                    expression: assignment,
                    sourceNodeId: node.id
                } as AST.ExpressionStatement;
            } else {
                return assignment;
            }
        }

        // --- Data Strings / values ---
        if (node.label === 'String' || node.codeType === 'String') {
            const val = parser.getNodeValue(node, 'value');
            return { type: 'Literal', value: String(val) };
        }
        if (node.label === 'Number' || node.codeType === 'Number') {
            const val = parser.getNodeValue(node, 'value');
            return { type: 'Literal', value: Number(val) };
        }
        if (node.label === 'Boolean' || node.codeType === 'Boolean') {
            const val = parser.getNodeValue(node, 'value');
            return { type: 'Literal', value: val === 'true' || val === true };
        }

        // --- Structures ---

        if (node.label === 'Array Builder') {
            const elements: AST.Expression[] = [];
            for (let i = 1; i <= 5; i++) {
                const item = parser.resolveInput(node, 'item' + i);
                elements.push(item);
            }
            return {
                type: 'ArrayExpression',
                elements,
                sourceNodeId: node.id
            } as AST.ArrayExpression;
        }

        if (node.label === 'Get Property' || node.codeType === 'Object Accessor') {
            const object = parser.resolveInput(node, 'object');
            const propName = parser.getNodeValue(node, 'property');
            return {
                type: 'MemberExpression',
                object: object,
                property: { type: 'Identifier', name: propName },
                computed: false,
                sourceNodeId: node.id
            } as AST.MemberExpression;
        }

        // Splitter (Pass-Through)
        if (node.label === 'Splitter' || node.codeType === 'Splitter') {
            // Just pass the input value through
            return parser.resolveInput(node, 'value');
        }

        return null; // Not a variable/data node
    }
}