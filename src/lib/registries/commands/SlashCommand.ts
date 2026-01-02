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
        const options: SlashOption[] = args[0] || [];

        return {
            nodes: [
                {
                    id: "root",
                    type: 'universal',
                    position: { x: 100, y: 100 },
                    data: {
                        _schemaId: 'event/slash-command',
                        description: "No description provided",
                        options: options
                    }
                }
            ],
            edges: []
        };
    }
};
