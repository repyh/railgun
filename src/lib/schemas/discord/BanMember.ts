import type { NodeSchema } from '@/lib/railgun-flow';

export const BanMemberSchema: NodeSchema = {
    id: 'discord/ban-member',
    label: 'Ban Member',
    category: 'Discord',
    description: 'Bans a member from the server.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'member', label: 'Member', socketType: 'Any', required: true, validationMessage: 'Member is required.' },
        { key: 'reason', label: 'Reason', socketType: 'String' },
        { key: 'deleteDays', label: 'Delete Msg Days', socketType: 'Number' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'reason', label: 'Reason', type: 'text' },
        { key: 'deleteDays', label: 'Delete Msg Days', type: 'text', props: { defaultValue: '0' } }
    ]
};
