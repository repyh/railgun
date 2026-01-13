import type { NodeSchema } from '@/lib/railgun-flow';

export const RemoveRoleSchema: NodeSchema = {
    id: 'discord/remove-role',
    label: 'Remove Role',
    category: 'Discord',
    description: 'Removes a role from a member.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'member', label: 'Member', socketType: 'Any', required: true, validationMessage: 'Member is required.' },
        { key: 'role', label: 'Role', socketType: 'Any', required: true, validationMessage: 'Role is required.' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: []
};
