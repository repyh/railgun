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
            label: "General Settings",
            description: "Basic configuration for your Discord bot.",
            fields: [
                {
                    key: "token",
                    label: "Bot Token",
                    type: "secret",
                    required: true,
                    description: "The token found in the Discord Developer Portal."
                },
                {
                    key: "prefix",
                    label: "Command Prefix",
                    type: "string",
                    default: "!",
                    description: "The character used to trigger commands (e.g., !ping)."
                },
                {
                    key: "status",
                    label: "Bot Status",
                    type: "string",
                    description: "The status text to display on the bot."
                },
                {
                    key: "ownerId",
                    label: "Owner ID",
                    type: "string",
                    description: "The Discord User ID of the bot owner."
                },
                {
                    key: "gatewayIntents",
                    label: "Gateway Intents",
                    type: "select",
                    default: ["Guilds", "GuildMessages", "MessageContent"],
                    description: "Events the bot will receive from Discord.",
                    options: [
                        { label: "Default", value: "Default" }
                    ]
                }
            ]
        }
    ]
};
