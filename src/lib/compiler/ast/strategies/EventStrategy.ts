import type { WrapperStrategy, WrappingMetadata } from './WrappingStrategy';

export class EventStrategy implements WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string {
        const { eventName, eventParams } = metadata;
        const once = metadata.once ? 'true' : 'false';

        // For events, param[0] might be 'client' (ready) or 'interaction' or 'message'
        // We'll leave specific client extraction to the body or assume context is available
        // Usually event handlers have (client) or (interaction), etc.

        return `module.exports = {
    name: '${eventName}',
    once: ${once},
    execute: async (${eventParams.join(', ')}) => {
        ${bodyCode}
    }
};`;
    }
}
