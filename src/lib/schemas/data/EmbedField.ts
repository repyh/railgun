import type { NodeSchema } from '@/lib/railgun-flow';

export const EmbedFieldSchema: NodeSchema = {
    id: 'data/embed-field',
    label: 'Embed Field',
    category: 'Data',
    description: 'Content field for rich embeds.',
    inputs: [
        { key: 'name', label: 'Name', socketType: 'String' },
        { key: 'value', label: 'Value', socketType: 'String' }
    ],
    outputs: [
        { key: 'field', label: 'Field Object', socketType: 'Any' }
    ],
    controls: [
        { key: 'inline', label: 'Inline', type: 'boolean', props: { defaultValue: false } }
    ]
};
