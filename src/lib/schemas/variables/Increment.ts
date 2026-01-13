import type { NodeSchema } from '@/lib/railgun-flow';

export const IncrementSchema: NodeSchema = {
    id: 'variables/increment',
    label: 'Increment',
    category: 'Variables',
    description: 'Increases a numeric variable.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text' },
        { key: 'amount', label: 'Amount', type: 'number', props: { defaultValue: 1 } }
    ]
};
