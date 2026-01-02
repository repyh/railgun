import type { NodeSchema } from '@/lib/railgun-flow';

export const OnReadySchema: NodeSchema = {
    id: 'event/on-ready',
    label: 'On Ready',
    category: 'Event',
    hideFromPalette: true,
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'client', label: 'Client', socketType: 'Any' }
    ],
    controls: []
};
