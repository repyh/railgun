import type { EventDefinition } from './EventDefinition';

export const MessageCreateEvent: EventDefinition = {
    id: 'messageCreate',
    label: 'messageCreate',
    description: 'Triggered when a message is sent in a guild or DM.',
    nodeLabel: 'On Message Create',
    defaultContent: (name: string, _id: string) => ({
        id: `event@${Date.now()}`,
        nodes: [
            {
                id: "root",
                label: name || "On Message Create",
                data: { eventType: 'messageCreate', nodeType: 'On Message Create' },
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
