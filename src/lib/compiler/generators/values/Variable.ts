import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const VariableGenerator: ValueGenerator = (node, key, ctx, resolver) => {
    const valControl = node.controls?.['value'] as any;
    if (valControl) {
        if (node.label === 'String') return `"${valControl.value}"`;
        if (node.label === 'Number') return valControl.value || '0';
        if (node.label === 'Boolean') return valControl.value || 'false';
    }
    return 'undefined';
};
