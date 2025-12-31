import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createGetGlobalVariableNode() {
    const node = new BotNode('Get Global Var', 'Variable');

    // Controls
    // User enters the name of the global variable to retrieve
    node.addControl('varName', new InputControl('', 'Variable Name', 'text'));

    // Outputs
    node.addOutput('value', new ClassicPreset.Output(Sockets.Any, 'Value'));

    return node;
}
