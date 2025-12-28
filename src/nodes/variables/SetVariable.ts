import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createSetVariableNode() {
    const node = new BotNode('Set Variable', 'Action');

    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('variable', new ClassicPreset.Input(Sockets.Any, 'Variable'));
    node.addInput('value', new ClassicPreset.Input(Sockets.Any, 'Value'));
    node.addControl('varName', new InputControl('', 'Variable Name', 'text'));

    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

    return node;
}
