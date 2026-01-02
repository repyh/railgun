import type { NodeSchema } from '@/lib/railgun-flow';

export const AwaitComponentSchema: NodeSchema = {
    id: 'discord/await-component',
    label: 'Wait for Interaction',
    category: 'Action', // Changed from Discord to Action to match generic wait feel, or keep Discord? Legacy said 'Action'.
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'message', label: 'Message (Target)', socketType: 'Any', required: true, validationMessage: 'Target Message is required.' },
        { key: 'time', label: 'Timeout (ms)', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Success', socketType: 'Exec' },
        { key: 'timeout', label: 'Timeout', socketType: 'Exec' },
        { key: 'interaction', label: 'Interaction', socketType: 'Any' }
    ],
    controls: [
        { key: 'time', label: 'Timeout (ms)', type: 'text', props: { defaultValue: '15000' } }
    ]
};
