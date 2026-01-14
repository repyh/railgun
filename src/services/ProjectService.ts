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
            const defaultContent = eventRegistry.generateContent(type, name, "event@" + Date.now());
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

            // Inject name into data
            if (defaultContent.nodes && defaultContent.nodes.length > 0) {
                defaultContent.nodes[0].data = {
                    ...defaultContent.nodes[0].data,
                    name: name
                };
            }

            return await createFileFn('commands', name, defaultContent);
        } catch (error) {
            console.error('Failed to create command:', error);
            throw error;
        }
    }
    /**
     * Creates a new slash command file using the CommandRegistry.
     */
    static async createSlashCommand(
        name: string,
        description: string,
        options: any[], // SlashOption[]
        createFileFn: (folder: 'events' | 'commands' | 'slash_commands', name: string, content: any) => Promise<string | null>
    ): Promise<string | null> {
        const { commandRegistry } = await import('@/lib/registries/CommandRegistry');
        try {
            // Pass options as the first argument in the array to generateContent
            // The SlashCommand definition expects args[0] to be the options array
            const defaultContent = commandRegistry.generateContent('slashCommand', "slash-command@" + Date.now(), [options]);

            // Inject description into the root node data if possible, or handle it in the registry
            if (defaultContent.nodes && defaultContent.nodes.length > 0) {
                defaultContent.nodes[0].data = {
                    ...defaultContent.nodes[0].data,
                    name: name,
                    description: description
                };
            }

            return await createFileFn('commands', name, defaultContent);
        } catch (error) {
            console.error('Failed to create slash command:', error);
            throw error;
        }
    }
}
