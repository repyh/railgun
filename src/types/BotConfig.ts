export interface BotConfig {
    /**
     * Gateway Intents required by the bot.
     * e.g., ['Guilds', 'GuildMessages', 'MessageContent']
     */
    intents: string[];

    /**
     * The command prefix for legacy commands.
     * Default: '!'
     */
    prefix: string;

    /**
     * User IDs of the bot owners/admins.
     * Used for restricted commands.
     */
    ownerIds: string[];

    /**
     * Whether to enforce Slash Commands (Interactions) over legacy commands.
     * Default: true
     */
    useSlashCommands: boolean;

    /**
     * Optional presence configuration.
     */
    presence?: {
        status: 'online' | 'idle' | 'dnd' | 'invisible';
        activity?: {
            type: 'PLAYING' | 'STREAMING' | 'LISTENING' | 'WATCHING' | 'COMPETING';
            name: string;
            url?: string;
        };
    };
}

export const DEFAULT_BOT_CONFIG: BotConfig = {
    intents: ['Guilds', 'GuildMessages', 'MessageContent'],
    prefix: '!',
    ownerIds: [],
    useSlashCommands: true
};
