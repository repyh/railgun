import type { NodeSchema } from '@/lib/railgun-flow';

export const OnMessageCreateSchema: NodeSchema = {
    id: 'event/on-message-create',
    label: 'On Message',
    category: 'Event',
    description: 'Triggered for every message sent.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message', socketType: 'Any' },
        { key: 'content', label: 'Content', socketType: 'String' },
        { key: 'author', label: 'Author', socketType: 'Any' }
    ],
    controls: []
};
