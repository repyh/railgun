import type { NodeSchema } from '@/lib/railgun-flow';

export const ComparisonSchema: NodeSchema = {
    id: 'logic/comparison',
    label: 'Comparison',
    category: 'Logic',
    description: 'Compares two values.',
    inputs: [
        { key: 'a', label: 'Value A', socketType: 'Any' },
        { key: 'b', label: 'Value B', socketType: 'Any' }
    ],
    outputs: [
        { key: 'result', label: 'Result', socketType: 'Boolean' }
    ],
    controls: [
        {
            key: 'op', label: 'Operator', type: 'select', props: {
                defaultValue: '==',
                options: [
                    { value: '==', label: 'Equal' },
                    { value: '!=', label: 'Not Equal' },
                    { value: '>', label: 'Greater Than' },
                    { value: '<', label: 'Less Than' },
                    { value: '>=', label: 'Greater or Equal' },
                    { value: '<=', label: 'Less or Equal' }
                ]
            }
        }
    ]
};
