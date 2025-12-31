import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createSetGlobalVariableNode() {
    const node = new BotNode('Set Global Var', 'Action');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('value', new ClassicPreset.Input(Sockets.Any, 'Value'));

    // Controls
    // User enters the name of the global variable to set
    node.addControl('varName', new InputControl('', 'Variable Name', 'text'));

    // Outputs
    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

    return node;
}
