import type { CommandDefinition } from './CommandDefinition';

export const LegacyCommand: CommandDefinition = {
    id: 'legacyCommand',
    label: 'Legacy Command',
    description: 'Triggered when a user types a specific prefix command.',
    nodeLabel: 'On Command',
    defaultContent: (_id: string, args: string[] = []) => {
        return {
            nodes: [
                {
                    id: "root",
                    type: 'universal',
                    position: { x: 100, y: 100 },
                    data: {
                        _schemaId: 'event/on-command',
                        args: args
                    }
                }
            ],
            edges: []
        };
    }
};
