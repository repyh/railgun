import type { NodeSchema } from '@/lib/railgun-flow';

export const BranchSchema: NodeSchema = {
    id: 'logic/branch',
    label: 'If',
    category: 'Logic',
    description: 'Directs the flow based on a boolean condition (True or False).',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'condition', label: 'Condition', socketType: 'Boolean' }
    ],
    outputs: [
        { key: 'true', label: 'True', socketType: 'Exec' },
        { key: 'false', label: 'False', socketType: 'Exec' }
    ],
    controls: []
};
