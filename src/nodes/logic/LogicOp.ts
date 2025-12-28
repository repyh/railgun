import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

const OPERATORS = [
    { value: '&&', label: 'AND (&&)' },
    { value: '||', label: 'OR (||)' },
];

export function createLogicOpNode(): BotNode {
    const node = new BotNode('Logic Op', 'Logic');

    // Inputs
    node.addInput('a', new ClassicPreset.Input(Sockets.Boolean, 'A'));
    node.addInput('b', new ClassicPreset.Input(Sockets.Boolean, 'B'));

    // Controls
    const control = new InputControl('&&', 'Operator');
    control.options = OPERATORS;
    node.addControl('op', control);

    // Outputs
    node.addOutput('result', new ClassicPreset.Output(Sockets.Boolean, 'Result'));

    return node;
}
