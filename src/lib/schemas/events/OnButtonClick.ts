import type { NodeSchema } from '@/lib/railgun-flow';

export const OnButtonClickSchema: NodeSchema = {
    id: 'event/on-button-click',
    label: 'On Button Click',
    category: 'Event',
    description: 'Triggered when a user clicks a button.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' },
        { key: 'customId', label: 'Custom ID', socketType: 'String' },
        { key: 'user', label: 'User', socketType: 'Any' }
    ],
    controls: [
        { key: 'customId', label: 'Filter ID', type: 'text', description: 'Trigger only for this ID' }
    ]
};
