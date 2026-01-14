import { type BotFlowNode } from '@/lib/railgun-flow';

export type NodeFactory = () => BotFlowNode;

export interface NodeDefinition {
    label: string;
    category: 'Event' | 'Action' | 'Logic' | 'Variable' | 'Function' | 'Math' | 'Discord' | 'Data' | string;
    factory: NodeFactory;
}
