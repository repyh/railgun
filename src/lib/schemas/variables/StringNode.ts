import type { NodeSchema } from '@/lib/railgun-flow';

export const StringSchema: NodeSchema = {
    id: 'variables/string',
    label: 'String',
    category: 'Variables',
    inputs: [],
    outputs: [
        { key: 'output', label: 'Value', socketType: 'String' }
    ],
    controls: [
        { key: 'value', label: 'Value', type: 'text', props: { defaultValue: '' } }
    ]
};
