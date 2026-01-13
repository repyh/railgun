import type { NodeSchema } from '@/lib/railgun-flow';

export const OnCommandSchema: NodeSchema = {
    id: 'event/on-command',
    label: 'On Message Command',
    category: 'Event',
    description: 'Triggered by legacy message commands.',
    inputs: [],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message', socketType: 'Any' },
        { key: 'author', label: 'Author', socketType: 'Any' },
        { key: 'args', label: 'Arguments', socketType: 'Array' }
    ],
    controls: [
        { key: 'command', label: 'Command Name', type: 'text' }
    ]
};
