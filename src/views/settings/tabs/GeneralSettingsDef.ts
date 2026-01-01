import type { SettingsTabDefinition } from "@/types/SettingDefinitions";

export const GeneralSettingsDef: SettingsTabDefinition = {
    id: 'general',
    label: 'General',
    groups: [
        {
            id: 'localization',
            title: 'Localization',
            description: 'Regional and language preferences.',
            settings: [
                {
                    key: 'general.locale',
                    label: 'Language',
                    description: 'The primary display language for the IDE.',
                    type: 'select',
                    options: [
                        { label: 'English (US)', value: 'en' },
                        { label: 'Indonesian', value: 'id' },
                    ]
                }
            ]
        },
        {
            id: 'system',
            title: 'System',
            description: 'Core application behavior and performance.',
            settings: [
                {
                    key: 'system.autoSave',
                    label: 'Auto Save',
                    description: 'Automatically save project changes when the editor loses focus.',
                    type: 'toggle'
                }
            ]
        }
    ]
};
