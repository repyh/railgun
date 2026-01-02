import type { NodeSchema } from '@/lib/railgun-flow';

export const ComparisonSchema: NodeSchema = {
    id: 'logic/comparison',
    label: 'Comparison',
    category: 'Logic',
    inputs: [
        { key: 'a', label: 'A', socketType: 'Any' },
        { key: 'b', label: 'B', socketType: 'Any' }
    ],
    outputs: [
        { key: 'result', label: 'Result', socketType: 'Boolean' }
    ],
    controls: [
        {
            key: 'op', label: 'Operator', type: 'select', props: {
                defaultValue: '===',
                options: [
                    { value: '==', label: 'Val Equal (==)' },
                    { value: '===', label: 'Strict Equal (===)' },
                    { value: '!=', label: 'Val Not Equal (!=)' },
                    { value: '!==', label: 'Strict Not Equal (!==)' },
                    { value: '>', label: 'Greater Than (>)' },
                    { value: '<', label: 'Less Than (<)' },
                    { value: '>=', label: 'Greater/Equal (>=)' },
                    { value: '<=', label: 'Less/Equal (<=)' }
                ]
            }
        }
    ]
};
