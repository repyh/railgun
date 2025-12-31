import type { CommandDefinition } from './CommandDefinition';

export const LegacyCommand: CommandDefinition = {
    id: 'legacyCommand',
    label: 'Legacy Command',
    description: 'Triggered when a user types a specific prefix command.',
    nodeLabel: 'On Command',
    defaultContent: (_id: string, args: string[] = []) => {
        const dynamicOutputs: any = {};
        args.forEach((argName, _i) => {
            // Use the name as the key, similar to Slash Commands
            dynamicOutputs[argName] = { socket: { name: argName } };
        });

        return {
            id: `command@${Date.now()}`,
            nodes: [
                {
                    id: "root",
                    label: "On Command",
                    category: "Event",
                    data: {
                        eventType: 'legacyCommand',
                        nodeType: 'On Command',
                        args: args // Store as metadata
                    },
                    inputs: {},
                    outputs: {
                        exec: { socket: { name: "Exec" } },
                        message: { socket: { name: "Message" } },
                        rawArgs: { socket: { name: "Raw Args" } },
                        ...dynamicOutputs
                    },
                    controls: {}
                }
            ],
            connections: []
        };
    }
};
