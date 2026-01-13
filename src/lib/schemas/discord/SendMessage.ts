import type { NodeSchema } from '@/lib/railgun-flow';

export const SendMessageSchema: NodeSchema = {
    id: 'discord/send-message',
    label: 'Send Message',
    category: 'Discord',
    description: 'Sends a message to a channel.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'channelId', label: 'Channel ID', socketType: 'String' },
        { key: 'content', label: 'Content', socketType: 'String' },
        { key: 'embed', label: 'Embed', socketType: 'Embed' },
        { key: 'components', label: 'Action Row', socketType: 'ActionRow' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Then', socketType: 'Exec' },
        { key: 'message', label: 'Sent Message', socketType: 'Any' }
    ],
    controls: [
        { key: 'content', label: 'Message Content', type: 'text' }
    ]
};
