import type { NodeSchema } from '@/lib/railgun-flow';

export const EditMessageSchema: NodeSchema = {
    id: 'discord/edit-message',
    label: 'Edit Message',
    category: 'Discord',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message (Target)', socketType: 'Any', required: true, validationMessage: 'Target Message is required.' },
        { key: 'content', label: 'Content', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Then', socketType: 'Exec' }
    ],
    controls: [
        { key: 'content', label: 'Content', type: 'text' }
    ]
};
