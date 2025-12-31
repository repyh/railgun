import type { CommandDefinition } from './CommandDefinition';

export interface SlashOption {
    name: string;
    description: string;
    type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE' | 'MENTIONABLE' | 'NUMBER' | 'ATTACHMENT';
    required: boolean;
}

export const SlashCommand: CommandDefinition = {
    id: 'slashCommand',
    label: 'Slash Command',
    description: 'A modern Discord Application Command with options.',
    nodeLabel: 'On Slash Command',
    defaultContent: (_id: string, args: any[] = []) => {
        // args[0] is strictly the options array
        const options: SlashOption[] = args[0] || [];

        const dynamicOutputs: any = {};
        options.forEach((opt) => {
            // Create an output for each option so it can be used in the graph
            dynamicOutputs[opt.name] = {
                socket: {
                    name: `${opt.name} (${opt.type})`
                }
            };
        });

        return {
            id: `slash-command@${Date.now()}`,
            nodes: [
                {
                    id: "root",
                    label: "On Slash Command",
                    category: "Event",
                    inputs: {},
                    outputs: {
                        exec: { socket: { name: "Exec" } },
                        user: { socket: { name: "User" } },
                        channel: { socket: { name: "Channel" } },
                        ...dynamicOutputs
                    },
                    data: {
                        name: _id, // Will be replaced by actual name
                        description: "No description provided",
                        options: options // Store metadata for the compiler
                    },
                    controls: {}
                }
            ],
            connections: []
        };
    }
};
