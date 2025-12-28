import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const DefaultGenerator: ValueGenerator = (node, key, ctx, resolver) => {
    return '0';
};
