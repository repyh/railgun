import { ClassicPreset } from 'rete';
import { BotNode, Sockets, InputControl } from '@/lib/railgun-rete';

export class ConstructEmbedNode extends BotNode {
    constructor() {
        super('Construct Embed', 'Discord');

        // Inputs (Data)
        this.addInput('title', new ClassicPreset.Input(Sockets.String, 'Title'));
        this.addInput('description', new ClassicPreset.Input(Sockets.String, 'Description'));
        this.addInput('color', new ClassicPreset.Input(Sockets.String, 'Color'));
        this.addInput('author', new ClassicPreset.Input(Sockets.String, 'Author Name'));
        this.addInput('image', new ClassicPreset.Input(Sockets.String, 'Image URL'));
        this.addInput('thumbnail', new ClassicPreset.Input(Sockets.String, 'Thumbnail URL'));
        this.addInput('footer', new ClassicPreset.Input(Sockets.String, 'Footer Text'));
        this.addInput('fields', new ClassicPreset.Input(Sockets.Array, 'Fields (Array)'));

        // Output (Object)
        this.addOutput('embed', new ClassicPreset.Output(Sockets.Embed, 'Embed'));

        // Controls (Default values / manual entry)
        this.addControl('title', new InputControl('', 'Title'));
        this.addControl('description', new InputControl('', 'Description'));
        this.addControl('color', new InputControl('#0099ff', 'Color'));
        this.addControl('author', new InputControl('', 'Author Name'));
        this.addControl('footer', new InputControl('', 'Footer Text'));
        this.addControl('image', new InputControl('', 'Image URL'));
        this.addControl('thumbnail', new InputControl('', 'Thumbnail URL'));
        this.addControl('timestamp', new InputControl('', 'Timestamp (ISO)')); // Optional timestamp
    }
}

export function createConstructEmbedNode() {
    return new ConstructEmbedNode();
}
