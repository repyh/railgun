export class ProjectService {
    /**
     * Creates a new event file using the EventRegistry.
     */
    static async createEvent(
        name: string,
        type: string,
        createFileFn: (folder: 'events' | 'commands', name: string, content: any) => Promise<string | null>
    ): Promise<string | null> {
        const { eventRegistry } = await import('@/lib/registries/EventRegistry');
        try {
            const defaultContent = eventRegistry.generateContent(type, "event@" + Date.now());
            return await createFileFn('events', name, defaultContent);
        } catch (error) {
            console.error('Failed to create event:', error);
            throw error;
        }
    }

    /**
     * Creates a new command file using the CommandRegistry.
     */
    static async createCommand(
        name: string,
        args: string[],
        createFileFn: (folder: 'events' | 'commands', name: string, content: any) => Promise<string | null>
    ): Promise<string | null> {
        const { commandRegistry } = await import('@/lib/registries/CommandRegistry');
        try {
            const defaultContent = commandRegistry.generateContent('legacyCommand', "command@" + Date.now(), args || []);
            return await createFileFn('commands', name, defaultContent);
        } catch (error) {
            console.error('Failed to create command:', error);
            throw error;
        }
    }
}
