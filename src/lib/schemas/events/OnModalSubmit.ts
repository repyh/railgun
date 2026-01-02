import type { NodeSchema } from '@/lib/railgun-flow';

export const OnModalSubmitSchema: NodeSchema = {
    id: 'event/on-modal-submit',
    label: 'On Modal Submit',
    category: 'Event',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' },
        { key: 'fields', label: 'Fields', socketType: 'Any' }
    ],
    controls: [
        { key: 'customId', label: 'Match Custom ID', type: 'text' }
    ]
};
