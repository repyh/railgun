import type { NodeSchema } from '@/lib/railgun-flow';

export const DeleteMessageSchema: NodeSchema = {
    id: 'discord/delete-message',
    label: 'Delete Message',
    category: 'Discord',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message (Target)', socketType: 'Any', required: true, validationMessage: 'Target Message is required.' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Then', socketType: 'Exec' }
    ],
    controls: []
};
