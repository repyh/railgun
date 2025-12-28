import type { ValueGenerator } from '../../interfaces';

export const DeclareVariableValueGenerator: ValueGenerator = (node, outputKey) => {
    if (outputKey === 'variable') {
        const inputCtrl = node.controls?.['varName'] as any;
        if (inputCtrl && inputCtrl.value) {
            return `${inputCtrl.value}_${node.id.replace(/-/g, '_')}`;
        }
        return `temp_${node.id.replace(/-/g, '_')}`;
    }
    return 'undefined';
};
