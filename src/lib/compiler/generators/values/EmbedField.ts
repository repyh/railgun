import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const EmbedFieldValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    const name = resolver.resolve(node, 'name', ctx) || "''";
    const value = resolver.resolve(node, 'value', ctx) || "''";
    const inline = resolver.resolve(node, 'inline', ctx) || 'false';

    return `{ name: ${name}, value: ${value}, inline: ${inline} }`;
};
