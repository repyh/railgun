import type { NodeSchema } from '@/lib/railgun-flow';

export const OnMessageCreateSchema: NodeSchema = {
    id: 'event/on-message',
    label: 'On Message',
    category: 'Event',
    hideFromPalette: true,
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message', socketType: 'Any' },
        { key: 'content', label: 'Content', socketType: 'String' },
        { key: 'channel', label: 'Channel', socketType: 'Any' },
        { key: 'author', label: 'Author', socketType: 'Any' }
    ],
    controls: []
};
