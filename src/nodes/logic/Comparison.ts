import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

const OPERATORS = [
    { value: '==', label: 'Val Equal (==)' },
    { value: '===', label: 'Strict Equal (===)' },
    { value: '!=', label: 'Val Not Equal (!=)' },
    { value: '!==', label: 'Strict Not Equal (!==)' },
    { value: '>', label: 'Greater Than (>)' },
    { value: '<', label: 'Less Than (<)' },
    { value: '>=', label: 'Greater/Equal (>=)' },
    { value: '<=', label: 'Less/Equal (<=)' },
];

export function createComparisonNode(): BotNode {
    const node = new BotNode('Comparison', 'Logic');

    // Inputs
    node.addInput('a', new ClassicPreset.Input(Sockets.Any, 'A'));
    node.addInput('b', new ClassicPreset.Input(Sockets.Any, 'B'));

    // Controls
    const control = new InputControl('===', 'Operator');
    control.options = OPERATORS; // Helper for UI to render dropdown if supported
    node.addControl('op', control);

    // Outputs
    node.addOutput('result', new ClassicPreset.Output(Sockets.Boolean, 'Result'));

    return node;
}
