import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createBranchNode(): BotNode {
    const node = new BotNode('If', 'Logic');

    // Inputs
    node.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
    node.addInput('condition', new ClassicPreset.Input(Sockets.Boolean, 'Condition'));

    // Outputs
    node.addOutput('true', new ClassicPreset.Output(Sockets.Exec, 'True'));
    node.addOutput('false', new ClassicPreset.Output(Sockets.Exec, 'False'));

    return node;
}
