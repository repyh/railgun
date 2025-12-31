import type { WrapperStrategy, WrappingMetadata } from './WrappingStrategy';

export class SlashCommandStrategy implements WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string {
        const { eventName } = metadata;
        const description = metadata.description || 'No description provided';

        // Typical Slash Command structure
        // We assume 'interaction' is the first param
        let builderCode = `new SlashCommandBuilder()
        .setName('${eventName}')
        .setDescription('${description}')`;

        if (metadata.options && metadata.options.length > 0) {
            metadata.options.forEach((opt: any) => {
                const name = opt.name;
                const description = opt.description || 'No description';
                const required = !!opt.required;

                switch (opt.type) {
                    case 'STRING':
                        builderCode += `\n        .addStringOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'INTEGER':
                        builderCode += `\n        .addIntegerOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'BOOLEAN':
                        builderCode += `\n        .addBooleanOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'USER':
                        builderCode += `\n        .addUserOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'CHANNEL':
                        builderCode += `\n        .addChannelOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'ROLE':
                        builderCode += `\n        .addRoleOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'MENTIONABLE':
                        builderCode += `\n        .addMentionableOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'NUMBER':
                        builderCode += `\n        .addNumberOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                    case 'ATTACHMENT':
                        builderCode += `\n        .addAttachmentOption(option => option.setName('${name}').setDescription('${description}').setRequired(${required}))`;
                        break;
                }
            });
        }

        return `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: ${builderCode},
    execute: async (interaction) => {
        const client = interaction.client;
        ${bodyCode}
    }
};`;
    }
}
