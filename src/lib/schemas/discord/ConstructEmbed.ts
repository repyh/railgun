import type { NodeSchema } from '@/lib/railgun-flow';

export const ConstructEmbedSchema: NodeSchema = {
    id: 'discord/construct-embed',
    label: 'Create Embed',
    category: 'Discord',
    description: 'Builds a rich embed object.',
    inputs: [
        { key: 'title', label: 'Title', socketType: 'String' },
        { key: 'description', label: 'Description', socketType: 'String' },
        { key: 'color', label: 'Color (Hex)', socketType: 'String' },
        { key: 'fields', label: 'Fields', socketType: 'Array' }
    ],
    outputs: [
        { key: 'embed', label: 'Embed', socketType: 'Embed' }
    ],
    controls: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'color', label: 'Color', type: 'color' }
    ]
};
