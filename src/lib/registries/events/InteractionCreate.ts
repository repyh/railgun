import type { EventDefinition } from './EventDefinition';

export const InteractionCreateEvent: EventDefinition = {
    id: 'interactionCreate',
    label: 'interactionCreate',
    description: 'Triggered when a user uses a slash command.',
    nodeLabel: 'On Slash Command',
    defaultContent: (_id: string) => ({
        id: `event@${Date.now()}`,
        nodes: [
            {
                id: "root",
                label: "On Interaction Create",
                category: "Event",
                inputs: {},
                outputs: {
                    exec: { socket: { name: "Exec" } },
                    user: { socket: { name: "User" } },
                    channel: { socket: { name: "Channel" } }
                }
            }
        ],
        connections: []
    })
};
