import { BotNode, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createPowerNode(): BotNode {
    const node = new BotNode('Power', 'Math');

    // Inputs
    node.addInput('base', new ClassicPreset.Input(Sockets.Number, 'Base'));
    node.addInput('exponent', new ClassicPreset.Input(Sockets.Number, 'Exponent'));

    // Output
    node.addOutput('result', new ClassicPreset.Output(Sockets.Number, 'Result'));

    return node;
}
