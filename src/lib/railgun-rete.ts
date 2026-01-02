import { ClassicPreset } from 'rete';

export type NodeCategory = 'Event' | 'Action' | 'Logic' | 'Variable' | 'Math' | 'Function' | string;

/**
 * The base class for all nodes in the visual editor.
 * Extends Rete's ClassicPreset.Node.
 */
export class BotNode extends ClassicPreset.Node {
    public category: NodeCategory;

    /**
     * codeType is the stable identifier used for compiler lookups (generators).
     * It allows `label` to be changed dynamically (e.g. for variable names) without breaking compilation.
     * Defaults to the initial label.
     */
    public codeType: string;

    public data: Record<string, any> = {};

    public height!: number;
    public width!: number;

    // Validation Metadata
    public requiredInputs: Set<string> = new Set();
    public validationMessages: Map<string, string> = new Map();

    constructor(label: string, category: NodeCategory = 'Action') {
        super(label);
        this.category = category;
        this.codeType = label;
        this.width = 200;
        this.height = 120;
    }

    public requireInput(key: string, message?: string) {
        this.requiredInputs.add(key);
        if (message) this.validationMessages.set(key, message);
        return this; // Chainable
    }

    /**
     * Optional custom validation logic.
     * Can be overridden by subclasses to implement complex rules.
     */
    public validate?(connections: any[]): { id: string, message: string, severity: 'error' | 'warning' }[];
}

/**
 * Predefined Rete Sockets for type safety in connections.
 */
export const Sockets = {
    Exec: new ClassicPreset.Socket('Exec'),
    String: new ClassicPreset.Socket('String'),
    Number: new ClassicPreset.Socket('Number'),
    Boolean: new ClassicPreset.Socket('Boolean'),
    Function: new ClassicPreset.Socket('Function'),
    Any: new ClassicPreset.Socket('Any'),
    Embed: new ClassicPreset.Socket('Embed'),
    Component: new ClassicPreset.Socket('Component'), // For Buttons/Select Menus
    ActionRow: new ClassicPreset.Socket('ActionRow'),
    Object: new ClassicPreset.Socket('Object'),
    Array: new ClassicPreset.Socket('Array'),
};

/**
 * Custom Input Control for Rete nodes.
 * Used for text inputs, number inputs, selects, etc. directly on the node.
 */
export class InputControl extends ClassicPreset.Control {
    public value: string;

    public label: string;
    public type: string;
    public options?: { value: string; label: string }[];

    //@ts-ignore
    constructor(public initial: string = '', label: string = '', type: string = 'text') {
        super();
        this.value = initial;
        this.label = label;
        this.type = type;
    }

    public setValue(val: string) {
        this.value = val;
    }
}
