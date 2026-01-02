import { ClassicPreset, NodeEditor } from 'rete';

export type NodeCategory = 'Event' | 'Action' | 'Logic' | 'Variable' | 'Math' | 'Function' | string;

export type Schemes = {
    Node: BotNode;
    Connection: ClassicPreset.Connection<BotNode, BotNode>;
};

let globalEditor: NodeEditor<Schemes> | null = null;

export function setGlobalEditor(editor: NodeEditor<Schemes>) {
    globalEditor = editor;
}

export function resolveSocketType(nodeId: string, _side: 'output', key: string): SocketTypeConfig {
    if (!globalEditor) return SOCKET_CONFIG['Any'];
    const node = globalEditor.getNode(nodeId);
    if (!node || !node.outputs[key]) return SOCKET_CONFIG['Any'];
    return getSocketConfig(node.outputs[key]!.socket.name);
}

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

export type SocketCategory = 'exec' | 'data';

export interface SocketTypeConfig {
    name: string;
    category: SocketCategory;
    color: string; // Tailwind class for Sockets (bg)
    connectionColor: string; // Hex for Connection (stroke)
}

export const SOCKET_CONFIG: Record<string, SocketTypeConfig> = {
    'Exec': { name: 'Exec', category: 'exec', color: 'bg-white', connectionColor: '#ffffff' },
    'Then': { name: 'Then', category: 'exec', color: 'bg-white', connectionColor: '#ffffff' },
    'else': { name: 'else', category: 'exec', color: 'bg-white', connectionColor: '#ffffff' },
    'Loop Body': { name: 'Loop Body', category: 'exec', color: 'bg-white', connectionColor: '#ffffff' },
    'Completed': { name: 'Completed', category: 'exec', color: 'bg-white', connectionColor: '#ffffff' },

    'String': { name: 'String', category: 'data', color: 'bg-yellow-400', connectionColor: '#facc15' },
    'Number': { name: 'Number', category: 'data', color: 'bg-blue-400', connectionColor: '#60a5fa' },
    'Boolean': { name: 'Boolean', category: 'data', color: 'bg-purple-400', connectionColor: '#c084fc' },
    'Function': { name: 'Function', category: 'data', color: 'bg-indigo-500', connectionColor: '#6366f1' },
    'Object': { name: 'Object', category: 'data', color: 'bg-orange-500', connectionColor: '#f97316' },
    'Array': { name: 'Array', category: 'data', color: 'bg-teal-500', connectionColor: '#14b8a6' },
    'Any': { name: 'Any', category: 'data', color: 'bg-zinc-400', connectionColor: '#a1a1aa' },

    // Fallbacks
    'Embed': { name: 'Embed', category: 'data', color: 'bg-pink-500', connectionColor: '#ec4899' },
    'Component': { name: 'Component', category: 'data', color: 'bg-cyan-500', connectionColor: '#06b6d4' },
    'ActionRow': { name: 'ActionRow', category: 'data', color: 'bg-cyan-600', connectionColor: '#0891b2' },
};

export function getSocketConfig(name: string): SocketTypeConfig {
    return SOCKET_CONFIG[name] || SOCKET_CONFIG['Any'];
}

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
