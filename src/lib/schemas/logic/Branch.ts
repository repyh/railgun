import type { NodeSchema } from '@/lib/railgun-flow';

export const BranchSchema: NodeSchema = {
    id: 'logic/branch',
    label: 'If',
    category: 'Logic',
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
