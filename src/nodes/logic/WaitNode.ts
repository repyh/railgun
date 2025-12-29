import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createWaitNode() {
    const node = new BotNode('Wait', 'Logic');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('duration', new ClassicPreset.Input(Sockets.Number, 'Duration (ms)'));

    // Outputs
    node.addOutput('completed', new ClassicPreset.Output(Sockets.Exec, 'Completed'));

    return node;
}
