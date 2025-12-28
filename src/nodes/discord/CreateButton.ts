import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class CreateButtonNode extends BotNode {
    constructor() {
        super('Create Button', 'Discord');

        this.addInput('label', new ClassicPreset.Input(Sockets.String, 'Label'));
        this.addInput('customId', new ClassicPreset.Input(Sockets.String, 'Custom ID'));
        // Style could be a dropdown, for now string input or default Primary
        this.addInput('style', new ClassicPreset.Input(Sockets.String, 'Style (Primary, Danger...)'));
        this.addInput('emoji', new ClassicPreset.Input(Sockets.String, 'Emoji'));

        this.addOutput('component', new ClassicPreset.Output(Sockets.Component, 'Component'));

        this.addControl('label', new InputControl('Click Me', 'Label'));
        this.addControl('customId', new InputControl('btn_1', 'Custom ID'));
        this.addControl('style', new InputControl('Primary', 'Style'));
    }
}

export function createCreateButtonNode() {
    return new CreateButtonNode();
}
