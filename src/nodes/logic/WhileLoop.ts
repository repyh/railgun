import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createWhileLoopNode() {
    const node = new BotNode('While Loop', 'Logic');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('condition', new ClassicPreset.Input(Sockets.Boolean, 'Condition'));

    // Outputs
    node.addOutput('completed', new ClassicPreset.Output(Sockets.Exec, 'Completed'));
    node.addOutput('loopBody', new ClassicPreset.Output(Sockets.Exec, 'Loop Body'));

    return node;
}
