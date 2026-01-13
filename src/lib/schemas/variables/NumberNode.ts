import type { NodeSchema } from '@/lib/railgun-flow';

export const NumberSchema: NodeSchema = {
    id: 'variables/number',
    label: 'Number',
    category: 'Variables',
    description: 'Number constant.',
    inputs: [],
    outputs: [
        { key: 'output', label: 'Value', socketType: 'Number' }
    ],
    controls: [
        { key: 'value', label: 'Value', type: 'number', props: { defaultValue: 0 } }
    ]
};
