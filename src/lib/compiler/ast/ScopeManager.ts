export type ScopeType = 'global' | 'function' | 'block';

export interface Scope {
    type: ScopeType;
    variables: Set<string>;
    parent?: Scope;
}

export class ScopeManager {
    private currentScope: Scope;

    constructor() {
        // Initialize with global scope
        this.currentScope = {
            type: 'global',
            variables: new Set(['client', 'console', 'require', 'module', 'process'])
        };
    }

    /**
     * Enters a new scope (e.g. inside a function or block).
     */
    enter(type: ScopeType) {
        const newScope: Scope = {
            type,
            variables: new Set(),
            parent: this.currentScope
        };
        this.currentScope = newScope;
    }

    /**
     * Exits the current scope, returning to the parent.
     */
    exit() {
        if (!this.currentScope.parent) {
            throw new Error('Cannot exit global scope');
        }
        this.currentScope = this.currentScope.parent;
    }

    /**
     * Declares a variable in the current scope.
     */
    define(name: string) {
        this.currentScope.variables.add(name);
    }

    /**
     * Checks if a variable is defined in the current scope or any parent scope.
     */
    isDefined(name: string): boolean {
        let scope: Scope | undefined = this.currentScope;
        while (scope) {
            if (scope.variables.has(name)) {
                return true;
            }
            scope = scope.parent;
        }
        return false;
    }
}
