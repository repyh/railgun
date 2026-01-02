import type { NodeSchema } from '@/lib/railgun-flow';

export const KickMemberSchema: NodeSchema = {
    id: 'discord/kick-member',
    label: 'Kick Member',
    category: 'Discord',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'member', label: 'Member', socketType: 'Any', required: true, validationMessage: 'Member is required.' },
        { key: 'reason', label: 'Reason', socketType: 'String' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'reason', label: 'Reason', type: 'text' }
    ]
};
