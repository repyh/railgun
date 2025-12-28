import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createNotNode(): BotNode {
    const node = new BotNode('Not', 'Logic');

    // Inputs
    node.addInput('value', new ClassicPreset.Input(Sockets.Boolean, 'Value'));

    // Outputs
    node.addOutput('result', new ClassicPreset.Output(Sockets.Boolean, 'Result'));

    return node;
}
