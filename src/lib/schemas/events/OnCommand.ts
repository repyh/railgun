import type { NodeSchema } from '@/lib/railgun-flow';

export const OnCommandSchema: NodeSchema = {
    id: 'event/on-command',
    label: 'On Command',
    category: 'Event',
    hideFromPalette: true,
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message', socketType: 'Any' },
        { key: 'rawArgs', label: 'Raw Args', socketType: 'Any' } // Array
    ],
    controls: [
        { key: 'name', label: 'Command Name', type: 'text' }
    ]
};
