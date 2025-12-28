import type { ValueGenerator } from '../../interfaces';

//@ts-ignore
export const ConstructEmbedValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    const title = resolver.resolve(node, 'title', ctx);
    const description = resolver.resolve(node, 'description', ctx);
    const color = resolver.resolve(node, 'color', ctx);
    const author = resolver.resolve(node, 'author', ctx);
    const image = resolver.resolve(node, 'image', ctx);
    const thumbnail = resolver.resolve(node, 'thumbnail', ctx);
    const footer = resolver.resolve(node, 'footer', ctx);

    if (ctx.addImport) {
        ctx.addImport("const { EmbedBuilder } = require('discord.js');");
    }

    let code = `new EmbedBuilder()`;

    // Only set if they are not empty strings or default 'null'/'undefined' stringified
    if (title && title !== "''" && title !== "'undefined'" && title !== 'undefined') code += `.setTitle(${title})`;
    if (description && description !== "''" && description !== "'undefined'" && description !== 'undefined') code += `.setDescription(${description})`;
    if (color && color !== "''" && color !== "'undefined'" && color !== 'undefined') code += `.setColor(${color})`;

    if (author && author !== 'undefined') code += `.setAuthor({ name: ${author} })`;
    if (image && image !== 'undefined') code += `.setImage(${image})`;
    if (thumbnail && thumbnail !== 'undefined') code += `.setThumbnail(${thumbnail})`;
    if (footer && footer !== 'undefined') code += `.setFooter({ text: ${footer} })`;

    const dataFields = (node.data as any)?.fields || [];
    let fieldsCode = '';

    // Handle manually added fields (Data)
    if (Array.isArray(dataFields) && dataFields.length > 0) {
        const manualFields = dataFields.map(f => {
            const name = f.name.replace(/'/g, "\\'");
            const value = f.value.replace(/'/g, "\\'");
            return `{ name: '${name}', value: '${value}', inline: ${f.inline} }`;
        }).join(', ');
        fieldsCode += manualFields;
    }

    // Handle connected array of fields
    const connectedFields = resolver.resolve(node, 'fields', ctx);

    if (connectedFields && connectedFields !== 'undefined' && connectedFields !== '[]') {
        if (fieldsCode.length > 0) {
            code += `.addFields(${fieldsCode})`;
        }

        code += `.addFields(...${connectedFields})`;

    } else if (fieldsCode.length > 0) {
        code += `.addFields(${fieldsCode})`;
    }

    return code;
};
