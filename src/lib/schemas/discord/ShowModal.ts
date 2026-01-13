import type { NodeSchema } from '@/lib/railgun-flow';

export const ShowModalSchema: NodeSchema = {
    id: 'discord/show-modal',
    label: 'Show Modal',
    category: 'Discord',
    description: 'Displays a modal popup interaction.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'target', label: 'Interaction', socketType: 'Any', required: true, validationMessage: 'Interaction is required.' },
        { key: 'title', label: 'Title', socketType: 'String' },
        { key: 'customId', label: 'Custom ID', socketType: 'String' },
        { key: 'input1_label', label: 'Input 1 Label', socketType: 'String' },
        { key: 'input1_id', label: 'Input 1 ID', socketType: 'String' },
        { key: 'input2_label', label: 'Input 2 Label', socketType: 'String' },
        { key: 'input2_id', label: 'Input 2 ID', socketType: 'String' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'title', label: 'Title', type: 'text', props: { defaultValue: 'My Modal' } },
        { key: 'customId', label: 'Custom ID', type: 'text', props: { defaultValue: 'modal_1' } }
    ]
};
