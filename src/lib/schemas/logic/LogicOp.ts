import type { NodeSchema } from '@/lib/railgun-flow';

export const LogicOpSchema: NodeSchema = {
    id: 'logic/logic-op',
    label: 'Logic Op',
    category: 'Logic',
    inputs: [
        { key: 'a', label: 'A', socketType: 'Boolean' },
        { key: 'b', label: 'B', socketType: 'Boolean' }
    ],
    outputs: [
        { key: 'result', label: 'Result', socketType: 'Boolean' }
    ],
    controls: [
        {
            key: 'op', label: 'Operator', type: 'select', props: {
                defaultValue: '&&',
                options: [
                    { value: '&&', label: 'AND (&&)' },
                    { value: '||', label: 'OR (||)' }
                ]
            }
        }
    ]
};
