import type { NodeSchema } from '@/lib/railgun-flow';

export const ForLoopSchema: NodeSchema = {
    id: 'logic/for-loop',
    label: 'For Loop',
    category: 'Logic',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'start', label: 'Start Index', socketType: 'Number' },
        { key: 'end', label: 'End Index', socketType: 'Number' },
        { key: 'updateFunc', label: 'Update Logic (Func)', socketType: 'Function' } // Note: socketType 'Function' needs verification if it exists in current types
    ],
    outputs: [
        { key: 'completed', label: 'Completed', socketType: 'Exec' },
        { key: 'body', label: 'Loop Body', socketType: 'Exec' },
        { key: 'index', label: 'Index', socketType: 'Number' }
    ],
    controls: []
};
