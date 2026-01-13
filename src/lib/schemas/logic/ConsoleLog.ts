import type { NodeSchema } from '@/lib/railgun-flow';

export const ConsoleLogSchema: NodeSchema = {
    id: 'action/console-log',
    label: 'Console Log',
    category: 'Action',
    description: 'Prints values to the console.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'msg', label: 'Message', socketType: 'String' }
    ],
    outputs: [
        { key: 'out', label: 'Out', socketType: 'Exec' }
    ],
    controls: [
        { key: 'msg', label: 'Message', type: 'text' }
    ]
};
