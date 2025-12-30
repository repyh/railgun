import type { EventDefinition } from './EventDefinition';

export const MessageCreateEvent: EventDefinition = {
    id: 'messageCreate',
    label: 'messageCreate',
    description: 'Triggered when a message is sent in a guild or DM.',
    nodeLabel: 'On Message Create',
    defaultContent: (_id: string) => ({
        id: `event@${Date.now()}`,
        nodes: [
            {
                id: "root",
                label: "On Message Create",
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
