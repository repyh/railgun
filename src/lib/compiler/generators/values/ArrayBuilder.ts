import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const ArrayBuilderValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    const inputs: string[] = [];

    ['item1', 'item2', 'item3', 'item4', 'item5'].forEach(key => {
        const val = resolver.resolve(node, key, ctx);

        if (val && val !== 'undefined' && val !== 'null') {
            inputs.push(val);
        }
    });

    return `[${inputs.join(', ')}]`;
};
