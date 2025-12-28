import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class EmbedFieldNode extends BotNode {
    constructor() {
        super('Embed Field', 'Data');

        // Inputs (for dynamic values)
        this.addInput('name', new ClassicPreset.Input(Sockets.String, 'Name'));
        this.addInput('value', new ClassicPreset.Input(Sockets.String, 'Value'));
        this.addInput('inline', new ClassicPreset.Input(Sockets.Boolean, 'Inline'));

        // Controls (for manual values)
        this.addControl('name', new InputControl('', 'Name'));
        this.addControl('value', new InputControl('', 'Value'));
        this.addControl('inline', new InputControl('false', 'Inline', 'checkbox'));

        // Output
        this.addOutput('field', new ClassicPreset.Output(Sockets.Object, 'Field Object'));
    }
}

export function createEmbedFieldNode() {
    return new EmbedFieldNode();
}
