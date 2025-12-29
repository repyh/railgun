import type { WrapperStrategy, WrappingMetadata } from './WrappingStrategy';

export class LegacyCommandStrategy implements WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string {
        const { eventName, eventParams } = metadata;

        // Ensure 'client' is extracted if message is the first param
        const clientSetup = eventParams.length > 0 && eventParams[0] === 'message'
            ? `const client = message.client;`
            : '';

        return `module.exports = {
    name: '${eventName}',
    description: '${metadata.description || 'No description provided'}',
    execute: async (${eventParams.join(', ')}) => {
        ${clientSetup}
        ${bodyCode}
    }
};`;
    }
}
