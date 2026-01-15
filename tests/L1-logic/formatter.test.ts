import { expect, test, describe } from "bun:test";
import { indentCode } from "@/lib/compiler/ast/strategies/WrappingStrategy";
import { CodePrinter } from "@/lib/compiler/ast/CodePrinter";
import * as AST from "@/lib/compiler/ast/types";

describe("JIT Formatter & Indentation", () => {
    describe("indentCode Helper", () => {
        test("should indent simple single line", () => {
            const code = "console.log('hi');";
            expect(indentCode(code, 4)).toBe("    console.log('hi');");
        });

        test("should indent multiline code and preserve relative indentation", () => {
            const code = "if (true) {\n    console.log('hi');\n}";
            const expected = "        if (true) {\n            console.log('hi');\n        }";
            expect(indentCode(code, 8)).toBe(expected);
        });

        test("should handle leading/trailing empty lines tightly", () => {
            const code = "\n\nconsole.log('main');\n\n";
            expect(indentCode(code, 4)).toBe("    console.log('main');");
        });

        test("should not add trailing spaces to empty lines", () => {
            const code = "line1\n\nline2";
            expect(indentCode(code, 4)).toBe("    line1\n\n    line2");
        });
    });

    describe("CodePrinter Semantic Formatting", () => {
        test("should enforce K&R style for if blocks", () => {
            const printer = new CodePrinter();
            const ifStmt: AST.IfStatement = {
                type: 'IfStatement',
                test: { type: 'Literal', value: true } as AST.Literal,
                consequent: {
                    type: 'BlockStatement',
                    body: [
                        {
                            type: 'ExpressionStatement',
                            expression: {
                                type: 'CallExpression',
                                callee: { type: 'Identifier', name: 'log' } as AST.Identifier,
                                arguments: []
                            } as AST.CallExpression
                        } as AST.ExpressionStatement
                    ]
                } as AST.BlockStatement
            };

            const result = printer.build(ifStmt);
            expect(result.code).toContain("if (true) {");
        });

        test("should add semantic spacing between distinct blocks", () => {
            const printer = new CodePrinter();
            const program: AST.Program = {
                type: 'Program',
                body: [
                    {
                        type: 'IfStatement',
                        test: { type: 'Literal', value: true } as AST.Literal,
                        consequent: { type: 'BlockStatement', body: [] } as AST.BlockStatement
                    } as AST.IfStatement,
                    {
                        type: 'ForStatement',
                        init: null,
                        test: null,
                        update: null,
                        body: { type: 'BlockStatement', body: [] } as AST.BlockStatement
                    } as AST.ForStatement
                ]
            };

            const result = printer.build(program);
            // Check for double newline (semantic spacing)
            expect(result.code).toContain("}\n\nfor");
        });
    });
});
