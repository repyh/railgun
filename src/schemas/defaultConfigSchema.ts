import type { ConfigSchema } from "@/types/ConfigSchema";

export const defaultConfigSchema: ConfigSchema = {
    groups: [
        {
            id: "metadata",
            label: "Project Metadata",
            description: "Read-only project information.",
            fields: [
                { key: "name", label: "Project Name", type: "string", readonly: true },
                { key: "version", label: "Version", type: "string", readonly: true },
                { key: "railgunVersion", label: "Railgun Version", type: "string", readonly: true }
            ]
        },
        {
            id: "general",
            label: "Bot Configuration",
            description: "Core settings for your Discord bot.",
            fields: [
                {
                    key: "prefix",
                    label: "Command Prefix",
                    type: "string",
                    default: "!",
                    description: "The character used to trigger commands (e.g., !ping)."
                },
                {
                    key: "gatewayIntents",
                    label: "Gateway Intents",
                    type: "select",
                    default: ["Guilds", "GuildMessages", "MessageContent"],
                    description: "Events the bot will receive from Discord. IMPORTANT: You must also enable these intents in the Discord Developer Portal under the 'Bot' tab.",
                    options: [
                        { label: "Guilds", value: "Guilds" },
                        { label: "GuildMessages", value: "GuildMessages" },
                        { label: "GuildMembers", value: "GuildMembers" },
                        { label: "MessageContent", value: "MessageContent" },
                        { label: "GuildPresences", value: "GuildPresences" },
                        { label: "DirectMessages", value: "DirectMessages" }
                    ]
                }
            ]
        }
    ]
};
