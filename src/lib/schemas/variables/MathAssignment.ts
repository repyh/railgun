import type { NodeSchema } from '@/lib/railgun-flow';

export const MathAssignmentSchema: NodeSchema = {
    id: 'variables/math-assignment',
    label: 'Math Assignment',
    category: 'Variables',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'variable', label: 'Variable Name', socketType: 'String' },
        { key: 'value', label: 'Value', socketType: 'Number' }
    ],
    outputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        {
            key: 'op', label: 'Operator', type: 'select', props: {
                defaultValue: '+=',
                options: [
                    { value: '+=', label: 'Add (+=)' },
                    { value: '-=', label: 'Subtract (-=)' },
                    { value: '*=', label: 'Multiply (*=)' },
                    { value: '/=', label: 'Divide (/=)' },
                    { value: '%=', label: 'Modulus (%=)' }
                ]
            }
        }
    ]
};
