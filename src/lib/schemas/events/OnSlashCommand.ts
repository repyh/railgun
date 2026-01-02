import type { NodeSchema } from '@/lib/railgun-flow';

export const OnSlashCommandSchema: NodeSchema = {
    id: 'event/slash-command',
    label: 'On Slash Command',
    category: 'Event',
    hideFromPalette: true,
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' },
        { key: 'channel', label: 'Channel', socketType: 'Any' },
        { key: 'user', label: 'User', socketType: 'Any' }
    ],
    controls: [
        { key: 'name', label: 'Command Name', type: 'text', props: { placeholder: 'ping' } }
    ]
};
