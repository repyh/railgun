import type { SettingsTabDefinition } from "@/types/SettingDefinitions";

export const RPCSettingsDef: SettingsTabDefinition = {
    id: 'rpc',
    label: 'Discord RPC',
    groups: [
        {
            id: 'status',
            title: 'Service Status',
            description: 'Manage the connection between Railgun and Discord.',
            settings: [
                {
                    key: 'system.discordRPC',
                    label: 'Enable Rich Presence',
                    description: 'Broadcast your current Railgun activity to your Discord profile.',
                    type: 'toggle'
                }
            ]
        },
        {
            id: 'details',
            title: 'Activity Details',
            description: 'Choose what information is shared in your status.',
            settings: [
                {
                    key: 'rpc.showProjectName',
                    label: 'Show Project Name',
                    description: 'Display the name of the active project.',
                    type: 'toggle'
                },
                {
                    key: 'rpc.showCurrentFile',
                    label: 'Show Current File',
                    description: 'Display the name of the file currently being edited.',
                    type: 'toggle'
                },
                {
                    key: 'rpc.showElapsedTime',
                    label: 'Show Elapsed Time',
                    description: 'Display the duration of your current session.',
                    type: 'toggle'
                }
            ]
        },
        {
            id: 'privacy',
            title: 'Privacy & Security',
            description: 'Protect sensitive project information.',
            settings: [
                {
                    key: 'rpc.privacyMode',
                    label: 'Privacy Mode',
                    description: 'Mask specific file names and project details with generic placeholders.',
                    type: 'toggle'
                }
            ]
        }
    ]
};
