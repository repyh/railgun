import type { StatementGenerator } from '../../interfaces';

export const DeclareVariableGenerator: StatementGenerator = (node, ctx, processor) => {
    const val = processor.resolveInput(node, 'value', ctx);

    const inputCtrl = node.controls?.['varName'] as any;
    const baseName = inputCtrl?.value || 'temp';

    const varName = `${baseName}_${node.id.replace(/-/g, '_')}`;

    return `\nlet ${varName} = ${val};\n`;
};
