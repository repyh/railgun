import type { EventDefinition } from './events/EventDefinition';
import { ClientReadyEvent } from './events/ClientReady';
import { MessageCreateEvent } from './events/MessageCreate';
import { InteractionCreateEvent } from './events/InteractionCreate';

class EventRegistry {
    private events: Map<string, EventDefinition> = new Map();

    constructor() {
        this.register(ClientReadyEvent);
        this.register(MessageCreateEvent);
        this.register(InteractionCreateEvent);
    }

    register(event: EventDefinition) {
        this.events.set(event.id, event);
    }

    get(id: string): EventDefinition | undefined {
        return this.events.get(id);
    }

    getAll(): EventDefinition[] {
        return Array.from(this.events.values());
    }

    generateContent(id: string, uuid: string): any {
        const event = this.get(id);
        if (!event) throw new Error(`Event type ${id} not found`);
        return event.defaultContent(uuid);
    }
}

export const eventRegistry = new EventRegistry();
