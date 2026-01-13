import type { NodeSchema } from '@/lib/railgun-flow';

export const ForLoopSchema: NodeSchema = {
    id: 'logic/for-loop',
    label: 'For Loop',
    category: 'Logic',
    description: 'Standard numeric for loop.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'start', label: 'Start Index', socketType: 'Number' },
        { key: 'end', label: 'End Index', socketType: 'Number' }
    ],
    outputs: [
        { key: 'completed', label: 'Completed', socketType: 'Exec' },
        { key: 'body', label: 'Loop Body', socketType: 'Exec' },
        { key: 'index', label: 'Index', socketType: 'Number' }
    ],
    controls: []
};
