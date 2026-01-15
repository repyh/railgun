import { type WrapperStrategy, type WrappingMetadata, indentCode } from './WrappingStrategy';

export class EventStrategy implements WrapperStrategy {
    wrap(bodyCode: string, metadata: WrappingMetadata): string {
        const { eventName, eventParams } = metadata;
        const once = metadata.once ? 'true' : 'false';

        return `module.exports = {
    name: '${eventName}',
    once: ${once},
    execute: async (${eventParams.join(', ')}) => {
${indentCode(bodyCode, 8)}
    }
};`;
    }
}
