import type { NodeSchema } from '@/lib/railgun-flow';

export const NotSchema: NodeSchema = {
    id: 'logic/not',
    label: 'Not',
    category: 'Logic',
    description: 'Inverts a boolean value.',
    inputs: [
        { key: 'value', label: 'Value', socketType: 'Boolean' }
    ],
    outputs: [
        { key: 'result', label: 'Result', socketType: 'Boolean' }
    ],
    controls: []
};
