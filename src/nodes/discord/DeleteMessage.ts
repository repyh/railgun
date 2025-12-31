import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createDeleteMessageNode() {
    const node = new BotNode('Delete Message', 'Action');

    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('message', new ClassicPreset.Input(Sockets.Any, 'Message (Target)'));

    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Then'));

    return node;
}
