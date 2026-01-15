import * as AST from './types';

export interface SourceMap {
    [lineNumber: number]: string;
}

export interface PrintResult {
    code: string;
    map: SourceMap;
}

export class CodePrinter {
    private lines: string[] = [];
    private map: SourceMap = {};

    /**
     * Generates code from the AST with Source Maps.
     */
    build(node: AST.BaseNode): PrintResult {
        this.lines = [];
        this.map = {};
        this.printStatement(node, 0);
        return {
            code: this.lines.join('\n'),
            map: this.map
        };
    }

    /**
     * Legacy compatibility method.
     * Returns just the generated code string.
     */
    print(node: AST.BaseNode, indentLevel: number = 0): string {
        // Create a temporary printer for this subtree
        const printer = new CodePrinter();
        // Use printStatement directly to respect the exact indentLevel
        printer.printStatement(node, indentLevel);
        return printer.lines.join('\n');
    }

    private emit(text: string, indent: number, node?: AST.BaseNode) {
        const prefix = '    '.repeat(indent);
        const linesToAdd = text.split('\n');

        linesToAdd.forEach((line, idx) => {
            const trimmedLine = line.trim();
            // Don't add double prefixing if the line is already being processed recursively
            const fullLine = trimmedLine.length > 0 ? prefix + line : line;
            this.lines.push(fullLine);

            // Map the line number (1-based index)
            if (node?.sourceNodeId && idx === 0) {
                this.map[this.lines.length] = node.sourceNodeId;
            }
        });
    }

    private ensureSpacing() {
        if (this.lines.length > 0 && this.lines[this.lines.length - 1] !== '') {
            this.lines.push('');
        }
    }

    private printStatement(node: AST.BaseNode, indent: number) {
        switch (node.type) {
            case 'Program':
                (node as AST.Program).body.forEach((stmt, idx) => {
                    this.printStatement(stmt, indent);
                    if (idx < (node as AST.Program).body.length - 1) {
                        this.ensureSpacing();
                    }
                });
                break;

            case 'FunctionDeclaration': {
                const func = node as AST.FunctionDeclaration;
                const asyncPrefix = func.async ? 'async ' : '';
                const params = func.params.map(p => p.name).join(', ');
                const header = `${asyncPrefix}function ${func.id?.name}(${params})`;

                this.emit(header + ' ' + this.printExpression(func.body), indent, func);
                break;
            }

            case 'BlockStatement': {
                const block = node as AST.BlockStatement;
                this.emit('{', indent, block);
                block.body.forEach((stmt, idx) => {
                    this.printStatement(stmt, indent + 1);
                    // Semantic spacing between major blocks inside functions
                    if (idx < block.body.length - 1) {
                        const nextStmt = block.body[idx + 1];
                        if (['IfStatement', 'ForStatement', 'ForOfStatement', 'WhileStatement', 'TryStatement'].includes(stmt.type) ||
                            ['IfStatement', 'ForStatement', 'ForOfStatement', 'WhileStatement', 'TryStatement'].includes(nextStmt.type)) {
                            this.ensureSpacing();
                        }
                    }
                });
                this.emit('}', indent);
                break;
            }

            case 'ExpressionStatement':
                this.emit(this.printExpression((node as AST.ExpressionStatement).expression) + ';', indent, node);
                break;

            case 'ReturnStatement':
                const ret = node as AST.ReturnStatement;
                const arg = ret.argument ? ` ${this.printExpression(ret.argument)}` : '';
                this.emit(`return${arg};`, indent, node);
                break;

            case 'IfStatement':
                const ifStmt = node as AST.IfStatement;
                const test = this.printExpression(ifStmt.test);
                if (ifStmt.consequent.type === 'BlockStatement') {
                    this.emit(`if (${test}) ` + this.printExpression(ifStmt.consequent), indent, ifStmt);
                } else {
                    this.emit(`if (${test})`, indent, ifStmt);
                    this.printStatement(ifStmt.consequent, indent + 1);
                }

                if (ifStmt.alternate) {
                    if (ifStmt.alternate.type === 'BlockStatement') {
                        // K&R style: "} else {"
                        // We need to back up and append to the last line, OR just emit carefully.
                        // Actually, our BlockStatement printer emits "}" on its own line.
                        // So "else {" should follow.
                        this.emit('else ' + this.printExpression(ifStmt.alternate), indent);
                    } else if (ifStmt.alternate.type === 'IfStatement') {
                        this.emit('else ' + this.printExpression(ifStmt.alternate), indent);
                    } else {
                        this.emit('else', indent);
                        this.printStatement(ifStmt.alternate, indent + 1);
                    }
                }
                break;

            case 'WhileStatement':
                const whileStmt = node as AST.WhileStatement;
                if (whileStmt.body.type === 'BlockStatement') {
                    this.emit(`while (${this.printExpression(whileStmt.test)}) ` + this.printExpression(whileStmt.body), indent, whileStmt);
                } else {
                    this.emit(`while (${this.printExpression(whileStmt.test)})`, indent, whileStmt);
                    this.printStatement(whileStmt.body, indent + 1);
                }
                break;

            case 'DoWhileStatement': {
                const doWhile = node as AST.DoWhileStatement;
                if (doWhile.body.type === 'BlockStatement') {
                    this.emit('do ' + this.printExpression(doWhile.body) + ` while (${this.printExpression(doWhile.test)});`, indent, doWhile);
                } else {
                    this.emit('do', indent, doWhile);
                    this.printStatement(doWhile.body, indent + 1);
                    this.emit(`while (${this.printExpression(doWhile.test)});`, indent);
                }
                break;
            }

            case 'VariableDeclaration':
                const varDecl = node as AST.VariableDeclaration;
                const decls = varDecl.declarations.map(d => {
                    const init = d.init ? ` = ${this.printExpression(d.init)}` : '';
                    return `${d.id.name}${init}`;
                }).join(', ');
                this.emit(`${varDecl.kind} ${decls};`, indent, varDecl);
                break;

            case 'ForOfStatement': {
                const forOf = node as AST.ForOfStatement;
                let leftStr = '';
                if (forOf.left.type === 'VariableDeclaration') {
                    const v = forOf.left as AST.VariableDeclaration;
                    const ds = v.declarations.map(d => `${d.id.name}${d.init ? ' = ' + this.printExpression(d.init) : ''}`).join(', ');
                    leftStr = `${v.kind} ${ds}`;
                } else {
                    leftStr = this.printExpression(forOf.left as AST.Expression);
                }

                const right = this.printExpression(forOf.right);
                const awaitStr = forOf.await ? 'await ' : '';
                const header = `for ${awaitStr}(${leftStr} of ${right})`;

                if (forOf.body.type === 'BlockStatement') {
                    this.emit(header + ' ' + this.printExpression(forOf.body), indent, forOf);
                } else {
                    this.emit(header, indent, forOf);
                    this.printStatement(forOf.body, indent + 1);
                }
                break;
            }

            case 'ForStatement': {
                const forS = node as AST.ForStatement;
                let initS = '';
                if (forS.init) {
                    if (forS.init.type === 'VariableDeclaration') {
                        const v = forS.init as AST.VariableDeclaration;
                        const ds = v.declarations.map(d => `${d.id.name}${d.init ? ' = ' + this.printExpression(d.init) : ''}`).join(', ');
                        initS = `${v.kind} ${ds}`;
                    } else {
                        initS = this.printExpression(forS.init);
                    }
                }
                const testS = forS.test ? this.printExpression(forS.test) : '';
                const updateS = forS.update ? this.printExpression(forS.update) : '';
                const header = `for (${initS}; ${testS}; ${updateS})`;

                if (forS.body.type === 'BlockStatement') {
                    this.emit(header + ' ' + this.printExpression(forS.body), indent, forS);
                } else {
                    this.emit(header, indent, forS);
                    this.printStatement(forS.body, indent + 1);
                }
                break;
            }

            case 'BreakStatement':
                this.emit('break;', indent, node);
                break;
            case 'ContinueStatement':
                this.emit('continue;', indent, node);
                break;

            case 'CommentStatement':
                this.emit(`// ${(node as AST.CommentStatement).text}`, indent, node);
                break;

            case 'TryStatement':
                const tryStmt = node as AST.TryStatement;
                this.emit('try ' + this.printExpression(tryStmt.block), indent, tryStmt);
                if (tryStmt.handler) {
                    const param = tryStmt.handler.param ? `(${tryStmt.handler.param.name})` : '';
                    this.emit(`catch ${param} ` + this.printExpression(tryStmt.handler.body), indent, tryStmt.handler);
                }
                if (tryStmt.finalizer) {
                    this.emit('finally ' + this.printExpression(tryStmt.finalizer), indent);
                }
                break;

            default:
                if (this.isExpression(node)) {
                    this.emit(this.printExpression(node as AST.Expression) + ';', indent, node);
                } else {
                    console.warn(`Unknown Statement type: ${node.type}`);
                    this.emit(`/* Unknown Statement: ${node.type} */`, indent);
                }
                break;
        }
    }

    private isExpression(node: AST.BaseNode): boolean {
        return [
            'CallExpression', 'MemberExpression', 'BinaryExpression', 'UnaryExpression',
            'AssignmentExpression', 'UpdateExpression', 'LogicalExpression', 'Identifier',
            'Literal', 'ArrayExpression', 'ObjectExpression', 'AwaitExpression',
            'ArrowFunctionExpression', 'NewExpression'
        ].includes(node.type);
    }

    private printExpression(node: AST.BaseNode): string {
        switch (node.type) {
            case 'BlockStatement':
                const bParams = new CodePrinter();
                return bParams.print(node);

            case 'FunctionDeclaration':
                const fParams = new CodePrinter();
                return fParams.print(node);

            case 'CallExpression':
                const call = node as AST.CallExpression;
                const args = call.arguments.map(arg => this.printExpression(arg)).join(', ');
                const callee = this.printExpression(call.callee);
                return `${callee}${call.optional ? '?.' : ''}(${args})`;

            case 'Identifier':
                return (node as AST.Identifier).name;

            case 'Literal':
                const lit = node as AST.Literal;
                if (typeof lit.value === 'string') return `'${lit.value}'`;
                return String(lit.value);

            case 'MemberExpression':
                const member = node as AST.MemberExpression;
                const obj = this.printExpression(member.object);
                const prop = this.printExpression(member.property);
                if (member.computed) {
                    return `${obj}${member.optional ? '?.' : ''}[${prop}]`;
                }
                return `${obj}${member.optional ? '?.' : '.'}${prop}`;

            case 'BinaryExpression':
                const binary = node as AST.BinaryExpression;
                return `(${this.printExpression(binary.left)} ${binary.operator} ${this.printExpression(binary.right)})`;

            case 'LogicalExpression':
                const logical = node as AST.LogicalExpression;
                return `(${this.printExpression(logical.left)} ${logical.operator} ${this.printExpression(logical.right)})`;

            case 'UnaryExpression':
                const unary = node as AST.UnaryExpression;
                return unary.prefix
                    ? `${unary.operator}${this.printExpression(unary.argument)}`
                    : `${this.printExpression(unary.argument)}${unary.operator}`;

            case 'UpdateExpression':
                const update = node as AST.UpdateExpression;
                return update.prefix
                    ? `${update.operator}${this.printExpression(update.argument)}`
                    : `${this.printExpression(update.argument)}${update.operator}`;

            case 'AssignmentExpression':
                const assign = node as AST.AssignmentExpression;
                return `${this.printExpression(assign.left)} ${assign.operator} ${this.printExpression(assign.right)}`;

            case 'ArrayExpression':
                const array = node as AST.ArrayExpression;
                return `[${array.elements.map(e => this.printExpression(e)).join(', ')}]`;

            case 'ObjectExpression': {
                const objExpr = node as AST.ObjectExpression;
                if (objExpr.properties.length === 0) return '{}';

                // If single property, keep it inline for brevity?
                // No, "ruthlessly deterministic" means we pick one mode.
                // Let's go multiline for all objects with props for "Premium" feel.
                const subPrinter = new CodePrinter();
                subPrinter.emit('{', 0);
                objExpr.properties.forEach((p, idx) => {
                    const key = (p.key.type === 'Identifier') ? p.key.name : subPrinter.printExpression(p.key);
                    const val = subPrinter.printExpression(p.value);
                    const comma = idx < objExpr.properties.length - 1 ? ',' : '';
                    subPrinter.emit(`${key}: ${val}${comma}`, 1);
                });
                subPrinter.emit('}', 0);
                return subPrinter.lines.join('\n');
            }

            case 'ArrowFunctionExpression':
                const arrow = node as AST.ArrowFunctionExpression;
                const aParams = arrow.params.map(p => p.name).join(', ');
                const aAsync = arrow.async ? 'async ' : '';
                const body = this.printExpression(arrow.body);
                return `${aAsync}(${aParams}) => ${body}`;

            case 'NewExpression':
                const newExpr = node as AST.NewExpression;
                return `new ${this.printExpression(newExpr.callee)}(${newExpr.arguments.map(a => this.printExpression(a)).join(', ')})`;

            case 'AwaitExpression':
                return `await ${this.printExpression((node as AST.AwaitExpression).argument)}`;

            default:
                return `/* Unknown Expression: ${node.type} */`;
        }
    }
}
