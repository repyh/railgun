import type { NodeSchema } from '@/lib/railgun-flow';

export const CreateActionRowSchema: NodeSchema = {
    id: 'discord/create-action-row',
    label: 'Create Action Row',
    category: 'Discord',
    description: 'Creates a row container for components.',
    inputs: [
        { key: 'comp1', label: 'Component 1', socketType: 'Component' },
        { key: 'comp2', label: 'Component 2', socketType: 'Component' },
        { key: 'comp3', label: 'Component 3', socketType: 'Component' }
    ],
    outputs: [
        { key: 'row', label: 'Action Row', socketType: 'ActionRow' }
    ],
    controls: []
};
