import type { Node } from '@xyflow/react';

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

export interface FlowSocket {
    key: string;
    label: string;
    socketType: string; // 'Exec', 'String', 'Number', etc. matching SOCKET_CONFIG keys
    required?: boolean;
    validationMessage?: string;
}

export interface NodeControl {
    key: string;
    type: 'text' | 'number' | 'select' | 'boolean' | 'code' | 'color';
    label: string;
    props?: Record<string, any>; // placeholder, initial, options...
    description?: string;
}

export interface NodeSchema {
    id: string; // e.g. 'discord/send-message'
    label: string;
    category: string; // 'Discord', 'Logic', 'Variable'
    description?: string;
    inputs: FlowSocket[];
    outputs: FlowSocket[];
    controls: NodeControl[];
    defaultData?: Record<string, any>;
    hideFromPalette?: boolean;
}

// The specific "data" object shape in React Flow nodes
export type BotNodeData = {
    _schemaId: string; // The schema ID to render with (e.g. 'discord/send-message')
    [key: string]: any; // User control values: { content: "hello", ... }
};

export type BotFlowNode = Node<BotNodeData>;
