import type { NodeSchema } from '@/lib/railgun-flow';

export const FunctionDefSchema: NodeSchema = {
    id: 'functions/def',
    label: 'Function Def',
    category: 'Function',
    inputs: [],
    outputs: [
        { key: 'fn', label: 'Ref', socketType: 'Function' },
        { key: 'exec', label: 'Body', socketType: 'Exec' },
        { key: 'arg0', label: 'Arg 0', socketType: 'Any' },
        { key: 'arg1', label: 'Arg 1', socketType: 'Any' },
        { key: 'arg2', label: 'Arg 2', socketType: 'Any' },
        { key: 'ret', label: 'Return Var', socketType: 'Any' }
    ],
    controls: [
        { key: 'name', label: 'Function Name', type: 'text', props: { defaultValue: 'myFunc' } }
    ]
};
