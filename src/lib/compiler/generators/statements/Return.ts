import type { StatementGenerator } from '../../interfaces';

export const ReturnGenerator: StatementGenerator = (node, ctx, processor) => {
    const val = processor.resolveInput(node, 'value', ctx);
    return `return ${val};\n`;
};
