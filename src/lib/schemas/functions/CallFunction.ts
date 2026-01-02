import type { NodeSchema } from '@/lib/railgun-flow';

export const CallFunctionSchema: NodeSchema = {
    id: 'functions/call',
    label: 'Call Function',
    category: 'Function',
    inputs: [
        { key: 'exec', label: 'Exec', socketType: 'Exec' },
        { key: 'fn', label: 'Function', socketType: 'Function' },
        { key: 'arg0', label: 'Arg 0', socketType: 'Any' },
        { key: 'arg1', label: 'Arg 1', socketType: 'Any' },
        { key: 'arg2', label: 'Arg 2', socketType: 'Any' }
    ],
    outputs: [
        { key: 'exec_out', label: 'Exec', socketType: 'Exec' },
        { key: 'result', label: 'Result', socketType: 'Any' }
    ],
    controls: []
};
