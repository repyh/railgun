export type ASTNodeType =
    | 'Program'
    | 'FunctionDeclaration'
    | 'BlockStatement'
    | 'ExpressionStatement'
    | 'ReturnStatement'
    | 'IfStatement'
    | 'WhileStatement'
    | 'DoWhileStatement'
    | 'ForStatement'
    | 'VariableDeclaration'
    | 'CallExpression'
    | 'MemberExpression'
    | 'BinaryExpression'
    | 'UnaryExpression'
    | 'AssignmentExpression' // Added for variable mutation
    | 'AssignmentExpression' // Added for variable mutation
    | 'Identifier'
    | 'Literal'
    | 'ArrayExpression'
    | 'ObjectExpression'
    | 'CommentStatement'
    | 'AwaitExpression'
    | 'ArrowFunctionExpression'
    | 'NewExpression'
    | 'ForOfStatement'
    | 'BreakStatement'
    | 'ContinueStatement';

export interface BaseNode {
    type: ASTNodeType;
    // Source mapping to the original Visual Node ID for debugging
    sourceNodeId?: string;
}

export interface Program extends BaseNode {
    type: 'Program';
    body: Statement[];
}

export type Statement =
    | FunctionDeclaration
    | BlockStatement
    | ExpressionStatement
    | ReturnStatement
    | IfStatement
    | WhileStatement
    | DoWhileStatement
    | ForOfStatement
    | BreakStatement
    | ContinueStatement
    | VariableDeclaration
    | CommentStatement; // Added for QoL

export interface CommentStatement extends BaseNode {
    type: 'CommentStatement';
    text: string;
}

export type Expression =
    | CallExpression
    | MemberExpression
    | BinaryExpression
    | UnaryExpression
    | AssignmentExpression
    | Identifier
    | Literal
    | ArrayExpression
    | ObjectExpression
    | AwaitExpression
    | ArrowFunctionExpression
    | NewExpression;

// --- Function & scopes ---

export interface FunctionDeclaration extends BaseNode {
    type: 'FunctionDeclaration';
    id: Identifier | null; // Null for anonymous functions (though usually we name ours)
    params: Identifier[];
    body: BlockStatement;
    async: boolean;
    isEvent?: boolean; // Metadata: is this an event handler?
    eventName?: string; // If event, what is the event name? (e.g. 'messageCreate')
}

export interface ArrowFunctionExpression extends BaseNode {
    type: 'ArrowFunctionExpression';
    params: Identifier[];
    body: BlockStatement | Expression; // Arrow functions can have expression body
    async: boolean;
}

export interface BlockStatement extends BaseNode {
    type: 'BlockStatement';
    body: Statement[];
}

export interface ReturnStatement extends BaseNode {
    type: 'ReturnStatement';
    argument: Expression | null;
}

// --- Control Flow ---

export interface IfStatement extends BaseNode {
    type: 'IfStatement';
    test: Expression;
    consequent: BlockStatement;
    alternate?: BlockStatement | null;
}

export interface WhileStatement extends BaseNode {
    type: 'WhileStatement';
    test: Expression;
    body: BlockStatement;
}

export interface DoWhileStatement extends BaseNode {
    type: 'DoWhileStatement';
    test: Expression;
    body: BlockStatement;
}

// --- Variables ---

export interface VariableDeclaration extends BaseNode {
    type: 'VariableDeclaration';
    kind: 'const' | 'let' | 'var'; // usually 'const' or 'let'
    declarations: VariableDeclarator[];
}

export interface VariableDeclarator {
    id: Identifier;
    init: Expression | null;
}

// --- Expressions ---

export interface ExpressionStatement extends BaseNode {
    type: 'ExpressionStatement';
    expression: Expression;
}

export interface CallExpression extends BaseNode {
    type: 'CallExpression';
    callee: Expression; // e.g., Identifier(myFunc) or MemberExpression(msg.reply)
    arguments: Expression[];
}

export interface MemberExpression extends BaseNode {
    type: 'MemberExpression';
    object: Expression;
    property: Identifier | Literal;
    computed: boolean; // true if object[property], false if object.property
}

export interface AssignmentExpression extends BaseNode {
    type: 'AssignmentExpression';
    operator: '=' | '+=' | '-=' | '*=' | '/=';
    left: Identifier | MemberExpression;
    right: Expression;
}

export interface BinaryExpression extends BaseNode {
    type: 'BinaryExpression';
    operator: string; // +, -, *, /, ==, ===, <, >, etc.
    left: Expression;
    right: Expression;
}

export interface Identifier extends BaseNode {
    type: 'Identifier';
    name: string;
}

export interface Literal extends BaseNode {
    type: 'Literal';
    value: string | number | boolean | null;
    raw?: string; // e.g. "'hello'"
}

export interface ArrayExpression extends BaseNode {
    type: 'ArrayExpression';
    elements: Expression[];
}

export interface ObjectExpression extends BaseNode {
    type: 'ObjectExpression';
    properties: Property[];
}

export interface Property {
    key: Identifier | Literal;
    value: Expression;
    kind: 'init';
}

export interface AwaitExpression extends BaseNode {
    type: 'AwaitExpression';
    argument: Expression;
}

export interface UnaryExpression extends BaseNode {
    type: 'UnaryExpression';
    operator: string; // !, -, +, typeof, void, delete
    argument: Expression;
    prefix: boolean;
}

export interface NewExpression extends BaseNode {
    type: 'NewExpression';
    callee: Expression;
    arguments: Expression[];
}

export interface ForOfStatement extends BaseNode {
    type: 'ForOfStatement';
    left: VariableDeclaration | Identifier; // for (const item of...) or for (item of...)
    right: Expression;
    body: BlockStatement;
    await: boolean; // for await (const x of y)
}

export interface BreakStatement extends BaseNode {
    type: 'BreakStatement';
    label?: Identifier | null;
}

export interface ContinueStatement extends BaseNode {
    type: 'ContinueStatement';
    label?: Identifier | null;
}
