import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class OnButtonClickNode extends BotNode {
    constructor() {
        super('On Button Click', 'Event');

        this.addOutput('exec', new ClassicPreset.Output(Sockets.Exec, 'Exec'));
        this.addOutput('interaction', new ClassicPreset.Output(Sockets.Any, 'Interaction'));

        this.addControl('customId', new InputControl('', 'Match Custom ID'));
    }
}

export function createOnButtonClickNode() {
    return new OnButtonClickNode();
}
