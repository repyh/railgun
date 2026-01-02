import type { NodeSchema } from '@/lib/railgun-flow';

export const CreateButtonSchema: NodeSchema = {
    id: 'discord/create-button',
    label: 'Create Button',
    category: 'Discord',
    inputs: [
        { key: 'label', label: 'Label', socketType: 'String' },
        { key: 'customId', label: 'Custom ID', socketType: 'String' },
        { key: 'style', label: 'Style', socketType: 'String' },
        { key: 'emoji', label: 'Emoji', socketType: 'String' }
    ],
    outputs: [
        { key: 'component', label: 'Component', socketType: 'Component' }
    ],
    controls: [
        { key: 'label', label: 'Label', type: 'text', props: { defaultValue: 'Click Me' } },
        { key: 'customId', label: 'Custom ID', type: 'text', props: { defaultValue: 'btn_1' } },
        {
            key: 'style', label: 'Style', type: 'select', props: {
                defaultValue: 'Primary',
                options: [
                    { value: 'Primary', label: 'Primary (Blurple)' },
                    { value: 'Secondary', label: 'Secondary (Grey)' },
                    { value: 'Success', label: 'Success (Green)' },
                    { value: 'Danger', label: 'Danger (Red)' },
                    { value: 'Link', label: 'Link (URL)' }
                ]
            }
        }
    ]
};
