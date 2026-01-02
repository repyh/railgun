import type { NodeSchema } from '@/lib/railgun-flow';

export const OnButtonClickSchema: NodeSchema = {
    id: 'event/on-button-click',
    label: 'On Button Click',
    category: 'Event',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' }
    ],
    controls: [
        { key: 'customId', label: 'Match Custom ID', type: 'text' }
    ]
};
