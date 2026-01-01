import type { SettingsTabDefinition } from "@/types/SettingDefinitions";

export const GeneralSettingsDef: SettingsTabDefinition = {
    id: 'general',
    label: 'General',
    groups: [
        {
            id: 'system',
            title: 'System',
            description: 'Core application behavior and performance.',
            settings: [
                {
                    key: 'system.autoSave',
                    label: 'Enable Auto Save',
                    description: 'Automatically save project changes when the editor loses focus or after a delay.',
                    type: 'toggle'
                },
                {
                    key: 'system.autoSaveDelay',
                    label: 'Auto Save Delay (ms)',
                    description: 'The amount of idle time before automatically saving changes.',
                    type: 'number',
                    min: 500,
                    max: 10000,
                    step: 500
                }
            ]
        }
    ]
};
