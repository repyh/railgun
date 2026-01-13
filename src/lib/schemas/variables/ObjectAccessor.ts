import type { NodeSchema } from '@/lib/railgun-flow';

export const ObjectAccessorSchema: NodeSchema = {
    id: 'variables/object-accessor',
    label: 'Get Property',
    category: 'Variables',
    description: 'Accesses object property.',
    inputs: [
        { key: 'object', label: 'Object', socketType: 'Any' }
    ],
    outputs: [
        { key: 'value', label: 'Value', socketType: 'Any' }
    ],
    controls: [
        { key: 'property', label: 'Property Path', type: 'text', props: { defaultValue: '' } }
    ]
};
