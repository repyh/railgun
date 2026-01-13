import type { NodeSchema } from '@/lib/railgun-flow';

export const OnModalSubmitSchema: NodeSchema = {
    id: 'event/on-modal-submit',
    label: 'On Modal Submit',
    category: 'Event',
    description: 'Triggered when a user submits a modal.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' },
        { key: 'customId', label: 'Custom ID', socketType: 'String' },
        { key: 'fields', label: 'Fields', socketType: 'Any' }
    ],
    controls: [
        { key: 'customId', label: 'Filter ID', type: 'text' }
    ]
};
