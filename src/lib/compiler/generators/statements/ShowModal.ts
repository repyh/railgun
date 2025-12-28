import type { StatementGenerator } from '../../interfaces';

export const ShowModalGenerator: StatementGenerator = (node, ctx, processor) => {
    const target = processor.resolveInput(node, 'target', ctx) || ctx.interactionVar || 'interaction';

    // Resolve Title/ID
    const title = processor.resolveInput(node, 'title', ctx) || "'Modal'";
    const customId = processor.resolveInput(node, 'customId', ctx) || "'modal_id'";

    // Inputs (Hardcoded 2 slots for now as defined in Node)
    // Need to construct TextInputBuilder -> ActionRowBuilder -> Modal addComponents

    const inputs: string[] = [];

    // Helper to generate text input code
    const generateInput = (labelKey: string, idKey: string) => {
        const label = processor.resolveInput(node, labelKey, ctx);
        const id = processor.resolveInput(node, idKey, ctx);

        if (label && label !== "''" && label !== 'undefined' && id && id !== "''" && id !== 'undefined') {
            return `
    new ActionRowBuilder().addComponents(
        new TextInputBuilder()
            .setCustomId(${id})
            .setLabel(${label})
            .setStyle(TextInputStyle.Short)
    )`;
        }
        return null;
    };

    const input1 = generateInput('input1_label', 'input1_id');
    if (input1) inputs.push(input1);

    const input2 = generateInput('input2_label', 'input2_id');
    if (input2) inputs.push(input2);


    // Add Imports
    if (ctx.addImport) {
        ctx.addImport("const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');");
    }

    const modalVar = `modal_${node.id.replace(/-/g, '_')}`;

    return `
const ${modalVar} = new ModalBuilder()
    .setCustomId(${customId})
    .setTitle(${title});

${inputs.length > 0 ? `${modalVar}.addComponents(${inputs.join(',')});` : ''}

await ${target}.showModal(${modalVar});
`;
};
