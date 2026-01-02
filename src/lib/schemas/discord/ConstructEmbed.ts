import type { NodeSchema } from '@/lib/railgun-flow';

export const ConstructEmbedSchema: NodeSchema = {
    id: 'discord/construct-embed',
    label: 'Construct Embed',
    category: 'Discord',
    inputs: [
        { key: 'title', label: 'Title', socketType: 'String' },
        { key: 'description', label: 'Description', socketType: 'String' },
        { key: 'color', label: 'Color', socketType: 'String' },
        { key: 'author', label: 'Author Name', socketType: 'String' },
        { key: 'image', label: 'Image URL', socketType: 'String' },
        { key: 'thumbnail', label: 'Thumbnail URL', socketType: 'String' },
        { key: 'footer', label: 'Footer Text', socketType: 'String' },
        { key: 'fields', label: 'Fields (Array)', socketType: 'Array' }
    ],
    outputs: [
        { key: 'embed', label: 'Embed', socketType: 'Embed' }
    ],
    controls: [
        { key: 'title', label: 'Title', type: 'text' },
        { key: 'description', label: 'Description', type: 'text' },
        { key: 'color', label: 'Color', type: 'color', props: { defaultValue: '#0099ff' } },
        { key: 'author', label: 'Author Name', type: 'text' },
        { key: 'footer', label: 'Footer Text', type: 'text' },
        { key: 'image', label: 'Image URL', type: 'text' },
        { key: 'thumbnail', label: 'Thumbnail URL', type: 'text' },
        { key: 'timestamp', label: 'Timestamp (ISO)', type: 'text' }
    ]
};
