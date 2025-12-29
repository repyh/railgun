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
                this.visitExpression(stmt.test);
                this.visitStatement(stmt.body);
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
                this.visitExpression(expr.left);
                this.visitExpression(expr.right);
                break;

            // TODO: MemberExpression, etc.
        }
    }
}
