import type { NodeParser } from './NodeParser';
import { BotNode } from '../../../railgun-rete';
import { GraphParser } from '../GraphParser';
import * as AST from '../types';

export class MathParser implements NodeParser {
    parse(node: BotNode, parser: GraphParser, _context: 'statement' | 'expression'): AST.Statement | AST.Expression | null {
        if (['Add', 'Subtract', 'Multiply', 'Divide', 'Modulus', 'Power'].includes(node.codeType || node.label)) {
            // Inputs are named 'a' and 'b' in the node definitions
            const left = parser.resolveInput(node, 'a');
            const right = parser.resolveInput(node, 'b');
            let op = '+';
            switch (node.codeType || node.label) {
                case 'Add': op = '+'; break;
                case 'Subtract': op = '-'; break;
                case 'Multiply': op = '*'; break;
                case 'Divide': op = '/'; break;
                case 'Modulus': op = '%'; break;
                case 'Power': op = '**'; break;
            }
            return {
                type: 'BinaryExpression',
                operator: op,
                left,
                right,
                sourceNodeId: node.id
            } as AST.BinaryExpression;
        }
        return null;
    }
}
