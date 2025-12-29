import * as AST from './types';

export class CodePrinter {

    /**
     * Generates code from the AST.
     */
    print(node: AST.BaseNode, indentLevel: number = 0): string {
        const indent = '    '.repeat(indentLevel);

        switch (node.type) {
            case 'Program':
                return (node as AST.Program).body
                    .map(stmt => this.print(stmt, indentLevel))
                    .join('\n\n');

            case 'FunctionDeclaration':
                const func = node as AST.FunctionDeclaration;
                const asyncPrefix = func.async ? 'async ' : '';
                const params = func.params.map(p => p.name).join(', ');

                // If it's an event handler (anonymous or module method), we might format it differently,
                // but for internal functions:
                return `${indent}${asyncPrefix}function ${func.id?.name}(${params}) ${this.print(func.body, indentLevel)}`;

            case 'BlockStatement':
                const block = node as AST.BlockStatement;
                const body = block.body.map(stmt => this.print(stmt, indentLevel + 1)).join('\n');
                return `{\n${body}\n${indent}}`;

            case 'ExpressionStatement':
                return `${indent}${this.print((node as AST.ExpressionStatement).expression, 0)};`;

            case 'IfStatement':
                const ifStmt = node as AST.IfStatement;
                let ifCode = `${indent}if (${this.print(ifStmt.test, 0)}) ${this.print(ifStmt.consequent, indentLevel)}`;
                if (ifStmt.alternate) {
                    ifCode += ` else ${this.print(ifStmt.alternate, indentLevel)}`;
                }
                return ifCode;

            case 'WhileStatement':
                const whileStmt = node as AST.WhileStatement;
                return `${indent}while (${this.print(whileStmt.test, 0)}) ${this.print(whileStmt.body, indentLevel)}`;

            case 'VariableDeclaration':
                const varDecl = node as AST.VariableDeclaration;
                const decls = varDecl.declarations.map(d => {
                    const init = d.init ? ` = ${this.print(d.init, 0)}` : '';
                    return `${d.id.name}${init}`;
                }).join(', ');
                return `${indent}${varDecl.kind} ${decls};`;

            case 'CallExpression':
                const call = node as AST.CallExpression;
                const args = call.arguments.map(arg => this.print(arg, 0)).join(', ');
                return `${this.print(call.callee, 0)}(${args})`;

            case 'Identifier':
                return (node as AST.Identifier).name;

            case 'Literal':
                const lit = node as AST.Literal;
                if (typeof lit.value === 'string') return `'${lit.value}'`;
                return String(lit.value);

            // TODO: MemberExpression, BinaryExpression, etc.

            default:
                console.warn(`Unknown node type: ${node.type}`);
                return `${indent}/* Unknown Node: ${node.type} */`;
        }
    }
}
