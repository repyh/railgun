import type { NodeSchema } from '@/lib/railgun-flow';

export const WhileLoopSchema: NodeSchema = {
    id: 'logic/while-loop',
    label: 'While Loop',
    category: 'Logic',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'condition', label: 'Condition', socketType: 'Boolean' }
    ],
    outputs: [
        { key: 'completed', label: 'Completed', socketType: 'Exec' },
        { key: 'loopBody', label: 'Loop Body', socketType: 'Exec' }
    ],
    controls: []
};
