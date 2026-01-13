import type { NodeSchema } from '@/lib/railgun-flow';

export const OnSlashCommandSchema: NodeSchema = {
    id: 'event/slash-command',
    label: 'On Slash Command',
    category: 'Event',
    description: 'Triggered by slash command interactions.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' },
        { key: 'user', label: 'User', socketType: 'Any' },
        { key: 'options', label: 'Options', socketType: 'Any' }
    ],
    controls: [
        { key: 'command', label: 'Command Name', type: 'text' }
    ]
};
