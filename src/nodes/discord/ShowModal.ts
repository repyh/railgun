import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class ShowModalNode extends BotNode {
    constructor() {
        super('Show Modal', 'Discord');

        this.addInput('exec', new ClassicPreset.Input(Sockets.Exec, 'Exec'));
        this.addInput('target', new ClassicPreset.Input(Sockets.Any, 'Interaction')); // Must be interaction

        this.addInput('title', new ClassicPreset.Input(Sockets.String, 'Title'));
        this.addInput('customId', new ClassicPreset.Input(Sockets.String, 'Custom ID'));

        this.addInput('input1_label', new ClassicPreset.Input(Sockets.String, 'Input 1 Label'));
        this.addInput('input1_id', new ClassicPreset.Input(Sockets.String, 'Input 1 ID'));

        this.addInput('input2_label', new ClassicPreset.Input(Sockets.String, 'Input 2 Label'));
        this.addInput('input2_id', new ClassicPreset.Input(Sockets.String, 'Input 2 ID'));

        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));

        this.addControl('title', new InputControl('My Modal', 'Title'));
        this.addControl('customId', new InputControl('my_modal', 'Custom ID'));
    }
}

export function createShowModalNode() {
    return new ShowModalNode();
}
