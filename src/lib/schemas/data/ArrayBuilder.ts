import type { NodeSchema } from '@/lib/railgun-flow';

export const ArrayBuilderSchema: NodeSchema = {
    id: 'data/array-builder',
    label: 'Array Builder',
    category: 'Data',
    description: 'Creates array from items.',
    inputs: [
        { key: 'item1', label: 'Item 1', socketType: 'Any' },
        { key: 'item2', label: 'Item 2', socketType: 'Any' },
        { key: 'item3', label: 'Item 3', socketType: 'Any' },
        { key: 'item4', label: 'Item 4', socketType: 'Any' },
        { key: 'item5', label: 'Item 5', socketType: 'Any' }
    ],
    outputs: [
        { key: 'array', label: 'Array', socketType: 'Array' }
    ],
    controls: []
};
