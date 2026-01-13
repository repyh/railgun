import type { NodeSchema } from '@/lib/railgun-flow';

export const AddRoleSchema: NodeSchema = {
    id: 'discord/add-role',
    label: 'Add Role',
    category: 'Discord',
    description: 'Assigns a role to a member.',
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
