import { BotNode } from '@/lib/railgun-rete';

export type NodeFactory = () => BotNode;

export interface NodeDefinition {
    label: string;
    category: 'Event' | 'Action' | 'Logic' | 'Variable' | 'Function' | 'Math' | 'Discord' | 'Data' | string;
    factory: NodeFactory;
}
