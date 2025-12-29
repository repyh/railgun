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

                // If it's an event handler (anonymous or module method), might format it differently,
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
                return `${this.print(call.callee, 0)}${call.optional ? '?.' : ''}(${args})`;

            case 'Identifier':
                return (node as AST.Identifier).name;

            case 'Literal':
                const lit = node as AST.Literal;
                if (typeof lit.value === 'string') return `'${lit.value}'`;
                return String(lit.value);

            case 'MemberExpression':
                const member = node as AST.MemberExpression;
                const obj = this.print(member.object, 0);
                const prop = this.print(member.property, 0);
                const op = member.optional ? '?.' : '.';
                if (member.computed) {
                    return `${obj}${member.optional ? '?.' : ''}[${prop}]`;
                } else {
                    return `${obj}${op}${prop}`;
                }



            case 'BinaryExpression':
                const binary = node as AST.BinaryExpression;
                return `(${this.print(binary.left, 0)} ${binary.operator} ${this.print(binary.right, 0)})`;

            case 'UnaryExpression':
                const unary = node as AST.UnaryExpression;
                if (unary.prefix) {
                    return `${unary.operator}${this.print(unary.argument, 0)}`;
                } else {
                    return `${this.print(unary.argument, 0)}${unary.operator}`;
                }

            case 'AssignmentExpression':
                const assign = node as AST.AssignmentExpression;
                return `${this.print(assign.left, 0)} ${assign.operator} ${this.print(assign.right, 0)}`;

            case 'ArrayExpression':
                const array = node as AST.ArrayExpression;
                const elements = array.elements.map(e => this.print(e, 0)).join(', ');
                return `[${elements}]`;

            case 'ObjectExpression':
                const objExpr = node as AST.ObjectExpression;
                const props = objExpr.properties.map(p => {
                    const key = (p.key.type === 'Identifier') ? p.key.name : this.print(p.key, 0);
                    return `${key}: ${this.print(p.value, 0)}`;
                }).join(',\n' + indent + '    '); // Formatting for readability
                // If empty, don't add newline
                if (props.length === 0) return '{}';
                return `{\n${indent}    ${props}\n${indent}}`;

            case 'ArrowFunctionExpression':
                const arrowFunc = node as AST.ArrowFunctionExpression;
                const arrowParams = arrowFunc.params.map(p => p.name).join(', ');
                const arrowAsyncPrefix = arrowFunc.async ? 'async ' : '';
                // Handle Expression body vs Block body
                const arrowBody = (arrowFunc.body.type === 'BlockStatement')
                    ? this.print(arrowFunc.body, indentLevel)
                    : this.print(arrowFunc.body, indentLevel);

                return `${arrowAsyncPrefix}(${arrowParams}) => ${arrowBody}`;

            case 'NewExpression':
                const newExpr = node as AST.NewExpression;
                const newCallee = this.print(newExpr.callee, indentLevel);
                const newArgs = newExpr.arguments.map(arg => this.print(arg, indentLevel)).join(', ');
                return `new ${newCallee}(${newArgs})`;

            case 'ForOfStatement': {
                const forOf = node as AST.ForOfStatement;
                const left = this.print(forOf.left, indentLevel);
                // Clean up variable decl in for loop (remove semi-colon if VariableDeclaration printer adds it)
                let leftStr = left.trim().replace(/;$/, '');
                const right = this.print(forOf.right, indentLevel);
                const body = this.print(forOf.body, indentLevel);
                const awaitStr = forOf.await ? 'await ' : '';
                return `${indent}for ${awaitStr}(${leftStr} of ${right}) ${body.trim()}`;
            }

            case 'ForStatement': {
                const forStmt = node as AST.ForStatement;
                const init = forStmt.init ? this.print(forStmt.init, 0).trim().replace(/;$/, '') : '';
                const test = forStmt.test ? this.print(forStmt.test, 0) : '';
                const update = forStmt.update ? this.print(forStmt.update, 0) : '';
                const body = this.print(forStmt.body, indentLevel);
                return `${indent}for (${init}; ${test}; ${update}) ${body.trim()}`;
            }

            case 'BreakStatement':
                return `${indent}break;`;

            case 'ContinueStatement':
                return `${indent}continue;`;

            case 'AwaitExpression':
                return `await ${this.print((node as AST.AwaitExpression).argument, 0)}`;

            case 'CommentStatement':
                return `${indent}// ${(node as AST.CommentStatement).text}`;

            default:
                console.warn(`Unknown node type: ${node.type}`);
                return `${indent}/* Unknown Node: ${node.type} */`;
        }
    }
}
