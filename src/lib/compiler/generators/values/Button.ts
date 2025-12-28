import type { ValueGenerator } from '../../interfaces';

const BUTTON_STYLES: Record<string, string> = {
    'Primary': 'ButtonStyle.Primary',
    'Secondary': 'ButtonStyle.Secondary',
    'Success': 'ButtonStyle.Success',
    'Danger': 'ButtonStyle.Danger',
    'Link': 'ButtonStyle.Link',
};

//@ts-ignore
export const ButtonValueGenerator: ValueGenerator = (node, outputKey, ctx, resolver) => {
    const label = resolver.resolve(node, 'label', ctx);
    const customId = resolver.resolve(node, 'customId', ctx);
    const styleRaw = resolver.resolve(node, 'style', ctx);
    const emoji = resolver.resolve(node, 'emoji', ctx);

    if (ctx.addImport) {
        ctx.addImport("const { ButtonBuilder, ButtonStyle } = require('discord.js');");
    }

    let style = 'ButtonStyle.Primary';
    const cleanStyle = styleRaw.replace(/['"]/g, '');
    if (BUTTON_STYLES[cleanStyle]) {
        style = BUTTON_STYLES[cleanStyle];
    }

    let code = `new ButtonBuilder()`;

    if (label && label !== "''") code += `.setLabel(${label})`;
    if (customId && customId !== "''") code += `.setCustomId(${customId})`;
    code += `.setStyle(${style})`;

    if (emoji && emoji !== 'undefined') code += `.setEmoji(${emoji})`;

    return code;
};
