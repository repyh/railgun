import type { NodeSchema } from '@/lib/railgun-flow';

export const IncrementSchema: NodeSchema = {
    id: 'variables/increment',
    label: 'Increment',
    category: 'Variables',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'variable', label: 'Variable Name', socketType: 'String' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        {
            key: 'op', label: 'Operator', type: 'select', props: {
                defaultValue: '++',
                options: [
                    { value: '++', label: 'Increment (++)' },
                    { value: '--', label: 'Decrement (--)' }
                ]
            }
        }
    ]
};
