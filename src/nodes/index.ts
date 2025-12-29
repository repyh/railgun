import { createConsoleLogNode } from './actions/ConsoleLog';
import { createForLoopNode } from './logic/ForLoop';
import { createComparisonNode } from './logic/Comparison';
import { createLogicOpNode } from './logic/LogicOp';
import { createNotNode } from './logic/Not';
import { createBranchNode } from './logic/Branch';
import { createDoWhileLoopNode } from './logic/DoWhileLoop';
import { createWaitNode } from './logic/WaitNode';
import { createWhileLoopNode } from './logic/WhileLoop';
import { createOnSlashCommandNode } from './events/OnSlashCommand';
import { createOnReadyNode } from './events/OnReady';
import { createOnCommandNode } from './events/OnCommand'; // New
import { createStringNode } from './variables/StringNode';
import { createNumberNode } from './variables/NumberNode';
import { createBooleanNode } from './variables/BooleanNode';
import { createSetVariableNode } from './variables/SetVariable';
import { createDeclareVariableNode } from './variables/DeclareVariable';
import { createFunctionDefNode } from './functions/FunctionDef';
import { createReturnNode } from './functions/Return';
import { createCallFunctionNode } from './functions/CallFunction';
import { createAddNode } from './math/AddNode';
import { createSubtractNode } from './math/SubtractNode';
import { createMultiplyNode } from './math/MultiplyNode';
import { createDivideNode } from './math/DivideNode';
import { createModulusNode } from './math/ModulusNode';
import { createObjectAccessorNode } from './variables/ObjectAccessor';
import { createIncrementNode } from './variables/Increment';
import { createMathAssignmentNode } from './variables/MathAssignment';
import { createPowerNode } from './math/PowerNode';
import { createConstructEmbedNode } from './discord/ConstructEmbed';
import { createCreateButtonNode } from './discord/CreateButton';
import { createActionRowNode } from './discord/CreateActionRow';
import { createSendMessageNode } from './discord/SendMessage';
import { createShowModalNode } from './discord/ShowModal';
import { createOnModalSubmitNode } from './events/OnModalSubmit';
import { createOnButtonClickNode } from './events/OnButtonClick';
import { createEmbedFieldNode } from './data/EmbedField';
import { createArrayBuilderNode } from './data/ArrayBuilder';
import { createSplitterNode } from './data/Splitter';
import { KickMemberNode, BanMemberNode, AddRoleNode, RemoveRoleNode } from './discord/MemberActions';
import { BotNode } from '@/lib/railgun-rete';

export type NodeFactory = () => BotNode;

export interface NodeDefinition {
    label: string;
    category: 'Event' | 'Action' | 'Logic' | 'Variable' | 'Function' | 'Math' | 'Discord' | string;
    factory: NodeFactory;
}

export const NODE_REGISTRY: NodeDefinition[] = [
    { label: 'Construct Embed', category: 'Discord', factory: createConstructEmbedNode },
    { label: 'Create Button', category: 'Discord', factory: createCreateButtonNode },
    { label: 'Create Action Row', category: 'Discord', factory: createActionRowNode },
    { label: 'Send Message', category: 'Discord', factory: createSendMessageNode },
    { label: 'Show Modal', category: 'Discord', factory: createShowModalNode },
    { label: 'Kick Member', category: 'Discord', factory: () => new KickMemberNode() },
    { label: 'Ban Member', category: 'Discord', factory: () => new BanMemberNode() },
    { label: 'Add Role', category: 'Discord', factory: () => new AddRoleNode() },
    { label: 'Remove Role', category: 'Discord', factory: () => new RemoveRoleNode() },
    { label: 'On Slash Command', category: 'Event', factory: createOnSlashCommandNode },
    { label: 'On Modal Submit', category: 'Event', factory: createOnModalSubmitNode },
    { label: 'On Button Click', category: 'Event', factory: createOnButtonClickNode },
    { label: 'On Ready', category: 'Event', factory: createOnReadyNode },
    { label: 'On Command', category: 'Event', factory: createOnCommandNode }, // New
    { label: 'Console Log', category: 'Action', factory: createConsoleLogNode },
    { label: 'For Loop', category: 'Logic', factory: createForLoopNode },
    { label: 'Comparison', category: 'Logic', factory: createComparisonNode },
    { label: 'Logic Op', category: 'Logic', factory: createLogicOpNode },
    { label: 'Not', category: 'Logic', factory: createNotNode },
    { label: 'If', category: 'Logic', factory: createBranchNode },
    { label: 'While Loop', category: 'Logic', factory: createWhileLoopNode },
    { label: 'Do-While Loop', category: 'Logic', factory: createDoWhileLoopNode },
    { label: 'Wait', category: 'Logic', factory: createWaitNode },

    { label: 'String', category: 'Variable', factory: createStringNode },
    { label: 'Number', category: 'Variable', factory: createNumberNode },
    { label: 'Boolean', category: 'Variable', factory: createBooleanNode },
    { label: 'Set Variable', category: 'Action', factory: createSetVariableNode },
    { label: 'Declare Variable', category: 'Action', factory: createDeclareVariableNode },
    { label: 'Get Property', category: 'Variable', factory: createObjectAccessorNode },
    { label: 'Function Def', category: 'Function', factory: createFunctionDefNode },
    { label: 'Return', category: 'Function', factory: createReturnNode },
    { label: 'Call Function', category: 'Function', factory: createCallFunctionNode },
    // Math
    { label: 'Add', category: 'Math', factory: createAddNode },
    { label: 'Subtract', category: 'Math', factory: createSubtractNode },
    { label: 'Multiply', category: 'Math', factory: createMultiplyNode },
    { label: 'Divide', category: 'Math', factory: createDivideNode },
    { label: 'Modulus', category: 'Math', factory: createModulusNode },
    { label: 'Power', category: 'Math', factory: createPowerNode },
    { label: 'Increment', category: 'Variable', factory: createIncrementNode },
    { label: 'Math Assignment', category: 'Variable', factory: createMathAssignmentNode },
    // Data
    { label: 'Embed Field', category: 'Data', factory: createEmbedFieldNode },
    { label: 'Array Builder', category: 'Data', factory: createArrayBuilderNode },
    { label: 'Splitter', category: 'Data', factory: createSplitterNode },
];

export function registerNodeDefinition(def: NodeDefinition) {
    // Remove existing if any (override)
    const existingIdx = NODE_REGISTRY.findIndex(n => n.label === def.label);
    if (existingIdx >= 0) {
        NODE_REGISTRY[existingIdx] = def;
    } else {
        NODE_REGISTRY.push(def);
    }
}

export function unregisterNodeDefinition(label: string) {
    const idx = NODE_REGISTRY.findIndex(n => n.label === label);
    if (idx >= 0) {
        NODE_REGISTRY.splice(idx, 1);
    }
}

export function createNode(label: string): BotNode | null {
    const def = NODE_REGISTRY.find(n => n.label === label);
    if (def) return def.factory();
    return null;
}
