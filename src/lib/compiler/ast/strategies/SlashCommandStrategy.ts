import type { WrapperStrategy, WrappingMetadata } from './WrappingStrategy';

export class SlashCommandStrategy implements WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string {
        const { eventName } = metadata;
        const description = metadata.description || 'No description provided';

        // Typical Slash Command structure
        // We assume 'interaction' is the first param
        return `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${eventName}')
        .setDescription('${description}'),
    execute: async (interaction) => {
        const client = interaction.client;
        ${bodyCode}
    }
};`;
    }
}
