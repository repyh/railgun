import type { CommandDefinition } from './CommandDefinition';

export const LegacyCommand: CommandDefinition = {
    id: 'legacyCommand',
    label: 'Legacy Command',
    description: 'Triggered when a user types a specific prefix command.',
    nodeLabel: 'On Command',
    defaultContent: (_id: string, args: any[] = []) => {
        const dynamicOutputs: any = {};
        args.forEach((arg, i) => {
            dynamicOutputs[`arg_${i}`] = { socket: { name: arg } };
        });

        return {
            id: `command@${Date.now()}`,
            nodes: [
                {
                    id: "root",
                    label: "On Command",
                    category: "Event",
                    data: { eventType: 'legacyCommand', nodeType: 'On Command' },
                    inputs: {},
                    outputs: {
                        exec: { socket: { name: "Exec" } },
                        message: { socket: { name: "Message" } },
                        args: { socket: { name: "Raw Args" } },
                        ...dynamicOutputs
                    },
                    controls: { // Controls will be set by the UI separately if needed, but for initial creation we can set defaults if passed
                    }
                }
            ],
            connections: []
        };
    }
};
