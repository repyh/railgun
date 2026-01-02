import type { NodeSchema } from '@/lib/railgun-flow';

export const SendMessageSchema: NodeSchema = {
    id: 'discord/send-message',
    label: 'Send Message',
    category: 'Discord',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'target', label: 'Channel / Interaction', socketType: 'Any', required: true, validationMessage: 'Target is required.' },
        { key: 'content', label: 'Content', socketType: 'String' }, // Custom validation in legacy: Content OR Embed required
        { key: 'embeds', label: 'Embeds', socketType: 'Embed' },
        { key: 'components', label: 'Components', socketType: 'ActionRow' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message', socketType: 'Any' }
    ],
    controls: [
        { key: 'content', label: 'Content', type: 'text', props: { placeholder: 'Hello World...' } }
    ]
};
