import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createConsoleLogNode() {
    const node = new BotNode('Console Log', 'Action');
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));

    const msgInput = new ClassicPreset.Input(Sockets.Any, 'Message');
    msgInput.addControl(new InputControl('', 'msg', 'text'));
    node.addInput('msg', msgInput);

    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Then'));
    return node;
}
