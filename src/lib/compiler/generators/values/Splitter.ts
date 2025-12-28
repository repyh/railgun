import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const SplitterValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    const val = resolver.resolve(node, 'value', ctx);

    return val || 'undefined';
};
