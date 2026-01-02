import type { NodeSchema } from '@/lib/railgun-flow';

export const DoWhileLoopSchema: NodeSchema = {
    id: 'logic/do-while-loop',
    label: 'Do-While Loop',
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
