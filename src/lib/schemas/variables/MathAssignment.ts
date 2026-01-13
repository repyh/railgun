import type { NodeSchema } from '@/lib/railgun-flow';

export const MathAssignmentSchema: NodeSchema = {
    id: 'variables/math-assignment',
    label: 'Math Assignment',
    category: 'Variables',
    description: 'Updates a variable using math operations.',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'value', label: 'Value', socketType: 'Number' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' }
    ],
    controls: [
        { key: 'varName', label: 'Variable Name', type: 'text' },
        {
            key: 'op', label: 'Operation', type: 'select', props: {
                options: [
                    { value: '+=', label: 'Add (+=)' },
                    { value: '-=', label: 'Subtract (-=)' },
                    { value: '*=', label: 'Multiply (*=)' },
                    { value: '/=', label: 'Divide (/=)' }
                ]
            }
        }
    ]
};
