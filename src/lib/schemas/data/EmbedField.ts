import type { NodeSchema } from '@/lib/railgun-flow';

export const EmbedFieldSchema: NodeSchema = {
    id: 'data/embed-field',
    label: 'Embed Field',
    category: 'Data',
    inputs: [
        { key: 'name', label: 'Name', socketType: 'String' },
        { key: 'value', label: 'Value', socketType: 'String' },
        { key: 'inline', label: 'Inline', socketType: 'Boolean' }
    ],
    outputs: [
        { key: 'field', label: 'Field Object', socketType: 'Object' }
    ],
    controls: [
        { key: 'name', label: 'Name', type: 'text', props: { defaultValue: '' } },
        { key: 'value', label: 'Value', type: 'text', props: { defaultValue: '' } },
        { key: 'inline', label: 'Inline', type: 'boolean', props: { defaultValue: false } }
    ]
};
