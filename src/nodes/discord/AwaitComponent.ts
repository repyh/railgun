import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createAwaitComponentNode() {
    const node = new BotNode('Wait for Interaction', 'Action');

    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('message', new ClassicPreset.Input(Sockets.Any, 'Message (Target)'));
    node.addInput('time', new ClassicPreset.Input(Sockets.Any, 'Timeout (ms)'));

    node.addControl('time', new InputControl('15000', 'Timeout (ms)'));

    node.addOutput('exec_out', new ClassicPreset.Output(Sockets.Exec, 'Success'));
    node.addOutput('timeout', new ClassicPreset.Output(Sockets.Exec, 'Timeout'));
    node.addOutput('interaction', new ClassicPreset.Output(Sockets.Any, 'Interaction'));

    return node;
}
