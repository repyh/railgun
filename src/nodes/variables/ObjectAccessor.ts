import { BotNode, InputControl, Sockets } from '@/lib/railgun-rete';
import { ClassicPreset } from 'rete';

export function createObjectAccessorNode(): BotNode {
    const node = new BotNode('Get Property', 'Variable');

    // Inputs
    node.addInput('object', new ClassicPreset.Input(Sockets.Any, 'Object'));

    // Controls
    node.addControl('property', new InputControl('', 'Property Path'));

    // Outputs
    node.addOutput('value', new ClassicPreset.Output(Sockets.Any, 'Value'));

    // Validation
    node.requireInput('object', 'Object input is required.');
    node.requireInput('property', 'Property Path is required.');

    return node;
}
