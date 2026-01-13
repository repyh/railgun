import type { NodeSchema } from '@/lib/railgun-flow';

export const WaitNodeSchema: NodeSchema = {
    id: 'logic/wait',
    label: 'Wait',
    category: 'Logic',
    description: 'Pauses execution for a duration.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'duration', label: 'Duration (ms)', socketType: 'Number' }
    ],
    outputs: [
        { key: 'completed', label: 'Completed', socketType: 'Exec' }
    ],
    controls: [
        { key: 'duration', label: 'Duration (ms)', type: 'number', props: { defaultValue: 1000 } }
    ]
};
