import type { NodeSchema } from '@/lib/railgun-flow';

export const OnReadySchema: NodeSchema = {
    id: 'event/on-ready',
    label: 'On Ready',
    category: 'Event',
    description: 'Triggered when the bot starts up.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'client', label: 'Client', socketType: 'Any' }
    ],
    controls: []
};
