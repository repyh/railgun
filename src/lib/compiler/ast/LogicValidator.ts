import * as AST from './types';
import { ScopeManager } from './ScopeManager';

export interface ValidationError {
    nodeId?: string;
    message: string;
    severity: 'error' | 'warning';
}

export class LogicValidator {
    errors: ValidationError[] = [];
    scopeManager: ScopeManager;

    constructor() {
        this.scopeManager = new ScopeManager();
    }

    validate(program: AST.Program): ValidationError[] {
        this.errors = [];
        this.visitBlock(program.body);
        return this.errors;
    }

    /**
     * Recursively visits statements and validates them.
     */
    private visitStatement(stmt: AST.Statement) {
        switch (stmt.type) {
            case 'FunctionDeclaration':
                if (stmt.id) {
                    this.scopeManager.define(stmt.id.name);
                }
                this.scopeManager.enter('function');
                // register params
                stmt.params.forEach(p => this.scopeManager.define(p.name));
                this.visitBlock(stmt.body.body);
                this.scopeManager.exit();
                break;

            case 'BlockStatement':
                this.scopeManager.enter('block');
                this.visitBlock(stmt.body);
                this.scopeManager.exit();
                break;

            case 'IfStatement':
                this.visitExpression(stmt.test);
                this.visitStatement(stmt.consequent);
                if (stmt.alternate) {
                    this.visitStatement(stmt.alternate);
                }
                break;

            case 'WhileStatement':
            case 'DoWhileStatement':
                this.visitExpression(stmt.test);
                this.visitStatement(stmt.body);
                break;

            case 'ForStatement':
                this.scopeManager.enter('block');
                if (stmt.init) {
                    if (stmt.init.type === 'VariableDeclaration') {
                        this.visitStatement(stmt.init);
                    } else {
                        this.visitExpression(stmt.init);
                    }
                }
                if (stmt.test) this.visitExpression(stmt.test);
                if (stmt.update) this.visitExpression(stmt.update);
                this.visitBlock(stmt.body.body);
                this.scopeManager.exit();
                break;

            case 'ForOfStatement':
                this.scopeManager.enter('block');
                if (stmt.left.type === 'VariableDeclaration') {
                    this.visitStatement(stmt.left);
                } else {
                    this.visitExpression(stmt.left);
                }
                this.visitExpression(stmt.right);
                this.visitBlock(stmt.body.body);
                this.scopeManager.exit();
                break;

            case 'VariableDeclaration':
                stmt.declarations.forEach(decl => {
                    this.scopeManager.define(decl.id.name);
                    if (decl.init) {
                        this.visitExpression(decl.init);
                    }
                });
                break;

            case 'ExpressionStatement':
                this.visitExpression(stmt.expression);
                break;

            case 'ReturnStatement':
                if (stmt.argument) this.visitExpression(stmt.argument);
                break;

            case 'BreakStatement':
            case 'ContinueStatement':
                // Break/Continue could be validated to be inside a loop, but for now simple visit
                break;
        }
    }

    private visitBlock(statements: AST.Statement[]) {
        statements.forEach(stmt => this.visitStatement(stmt));
    }

    private visitExpression(expr: AST.Expression) {
        switch (expr.type) {
            case 'Identifier':
                if (!this.scopeManager.isDefined(expr.name)) {
                    this.errors.push({
                        nodeId: expr.sourceNodeId,
                        message: `Variable '${expr.name}' is not defined.`,
                        severity: 'error'
                    });
                }
                break;

            case 'CallExpression':
                this.visitExpression(expr.callee);
                expr.arguments.forEach(arg => this.visitExpression(arg));
                break;

            case 'BinaryExpression':
            case 'LogicalExpression':
            case 'AssignmentExpression':
                this.visitExpression(expr.left);
                this.visitExpression(expr.right);
                break;

            case 'UnaryExpression':
            case 'UpdateExpression':
            case 'AwaitExpression':
                this.visitExpression(expr.argument);
                break;

            case 'MemberExpression':
                this.visitExpression(expr.object);
                if (expr.computed) {
                    this.visitExpression(expr.property as AST.Expression);
                }
                break;

            case 'ArrayExpression':
                expr.elements.forEach(e => this.visitExpression(e));
                break;

            case 'ObjectExpression':
                expr.properties.forEach(p => this.visitExpression(p.value));
                break;

            case 'ArrowFunctionExpression':
                this.scopeManager.enter('function');
                expr.params.forEach(p => this.scopeManager.define(p.name));
                if (expr.body.type === 'BlockStatement') {
                    this.visitBlock(expr.body.body);
                } else {
                    this.visitExpression(expr.body);
                }
                this.scopeManager.exit();
                break;

            case 'NewExpression':
                this.visitExpression(expr.callee);
                expr.arguments.forEach(arg => this.visitExpression(arg));
                break;
        }
    }
}
