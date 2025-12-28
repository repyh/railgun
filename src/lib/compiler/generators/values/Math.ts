import type { ValueGenerator } from '../../interfaces';

const MATH_OPS: Record<string, string> = {
    'Subtract': '-',
    'Multiply': '*',
    'Divide': '/',
    'Modulus': '%',
    'Add': '+'
};

//@ts-ignore
export const MathGenerator: ValueGenerator = (node, key, ctx, resolver) => {
    const valA = resolver.resolve(node, 'a', ctx);
    const valB = resolver.resolve(node, 'b', ctx);

    const op = MATH_OPS[node.label] || '+';
    return `(${valA} ${op} ${valB})`;
};
