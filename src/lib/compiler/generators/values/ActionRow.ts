import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const ActionRowValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    // Collect all component inputs
    const components: string[] = [];

    ['comp1', 'comp2', 'comp3', 'comp4', 'comp5'].forEach(key => {
        const val = resolver.resolve(node, key, ctx);
        if (val && val !== '0' && val !== 'undefined' && val !== 'null') {
            components.push(val);
        }
    });

    if (ctx.addImport) {
        ctx.addImport("const { ActionRowBuilder } = require('discord.js');");
    }

    if (components.length === 0) {
        return 'new ActionRowBuilder()';
    }

    return `new ActionRowBuilder().addComponents(${components.join(', ')})`;
};
