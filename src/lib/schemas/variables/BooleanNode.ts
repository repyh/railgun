import type { NodeSchema } from '@/lib/railgun-flow';

export const BooleanSchema: NodeSchema = {
    id: 'variables/boolean',
    label: 'Boolean',
    category: 'Variables',
    description: 'Boolean constant.',
    inputs: [],
    outputs: [
        { key: 'output', label: 'Value', socketType: 'Boolean' }
    ],
    controls: [
        { key: 'value', label: 'Value', type: 'boolean', props: { defaultValue: false } }
    ]
};
