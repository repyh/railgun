import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createEditMessageNode() {
    const node = new BotNode('Edit Message', 'Action');

    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('message', new ClassicPreset.Input(Sockets.Any, 'Message (Target)'));
    node.addInput('content', new ClassicPreset.Input(Sockets.Any, 'Content'));
    node.addControl('content', new InputControl('', 'Content'));

    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Then'));

    return node;
}
