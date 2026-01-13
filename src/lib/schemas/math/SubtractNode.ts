import type { NodeSchema } from '@/lib/railgun-flow';

export const SubtractSchema: NodeSchema = {
    id: 'math/subtract',
    label: 'Subtract',
    category: 'Math',
    description: 'Subtracts the second value from the first.',
    inputs: [
        { key: 'a', label: 'A', socketType: 'Number' },
        { key: 'b', label: 'B', socketType: 'Number' }
    ],
    outputs: [
        { key: 'value', label: 'Result', socketType: 'Number' }
    ],
    controls: [
        { key: 'a_val', label: 'A', type: 'number', props: { defaultValue: 0 } },
        { key: 'b_val', label: 'B', type: 'number', props: { defaultValue: 0 } }
    ]
};
