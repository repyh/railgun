import type { NodeSchema } from '@/lib/railgun-flow';
import { Schemas } from '@/lib/schemas';

class Registry {
    private schemas: Map<string, NodeSchema> = new Map();

    constructor() {
        this.registerAll(Schemas);
    }

    public register(schema: NodeSchema) {
        this.schemas.set(schema.id, schema);
    }

    public unregister(id: string) {
        this.schemas.delete(id);
    }

    public registerAll(schemas: NodeSchema[]) {
        schemas.forEach(s => this.register(s));
    }

    public get(id: string): NodeSchema | undefined {
        let schema = this.schemas.get(id);

        if (!schema) {
            // Comprehensive Legacy Mapping
            const legacyMappings: Record<string, string> = {
                // Events
                'On Command': 'event/on-command',
                'On Message Create': 'event/on-message-create',
                'On Ready': 'event/on-ready',
                'On Slash Command': 'event/slash-command',
                'On Modal Submit': 'event/on-modal-submit',
                'On Button Click': 'event/on-button-click',

                // Logic
                'If': 'logic/branch',
                'Comparison': 'logic/comparison',
                'Logic Op': 'logic/logic-op',
                'Not': 'logic/not',
                'While Loop': 'logic/while-loop',
                'Do-While Loop': 'logic/do-while-loop',
                'For Loop': 'logic/for-loop',
                'Wait': 'logic/wait',

                // Variables
                'String': 'variables/string',
                'Number': 'variables/number',
                'Boolean': 'variables/boolean',
                'Set Variable': 'variables/set-variable',
                'Declare Variable': 'variables/declare-variable',
                'Get Global Var': 'variables/get-global',
                'Set Global Var': 'variables/set-global',
                'Get Property': 'variables/object-accessor',
                'Increment': 'variables/increment',
                'Math Assignment': 'variables/math-assignment',

                // Math
                'Add': 'math/add',
                'Subtract': 'math/subtract',
                'Multiply': 'math/multiply',
                'Divide': 'math/divide',
                'Modulus': 'math/modulus',
                'Power': 'math/power',

                // Discord
                'Construct Embed': 'discord/construct-embed',
                'Create Button': 'discord/create-button',
                'Create Action Row': 'discord/create-action-row',
                'Send Message': 'discord/send-message',
                'Show Modal': 'discord/show-modal',
                'Edit Message': 'discord/edit-message',
                'Delete Message': 'discord/delete-message',
                'Wait for Interaction': 'discord/await-component',
                'Kick Member': 'discord/kick-member',
                'Ban Member': 'discord/ban-member',
                'Add Role': 'discord/add-role',
                'Remove Role': 'discord/remove-role',

                // Functions
                'Function Def': 'functions/def',
                'Return': 'functions/return',
                'Call Function': 'functions/call',

                // Actions / Data
                'Console Log': 'action/console-log',
                'Embed Field': 'data/embed-field',
                'Array Builder': 'data/array-builder',
                'Splitter': 'data/splitter',
            };

            const mappedId = legacyMappings[id];
            if (mappedId) {
                schema = this.schemas.get(mappedId);
            }
        }

        if (!schema) {
            // Handle legacy singular/plural categorization for variable paths
            if (id.startsWith('variable/')) {
                schema = this.schemas.get(id.replace('variable/', 'variables/'));
            }
        }
        return schema;
    }

    public getAll(): NodeSchema[] {
        return Array.from(this.schemas.values());
    }
}

export const NodeSchemaRegistry = new Registry();
