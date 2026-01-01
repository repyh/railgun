import type { SettingsTabDefinition } from "@/types/SettingDefinitions";

export const EditorSettingsDef: SettingsTabDefinition = {
    id: 'editor',
    label: 'Editor',
    groups: [
        {
            id: 'canvas',
            title: 'Canvas & Grid',
            description: 'Configure the visual behavior of the node editor canvas.',
            settings: [
                {
                    key: 'editor.showGrid',
                    label: 'Show Grid',
                    description: 'Render a background grid for better node alignment.',
                    type: 'toggle'
                },
                {
                    key: 'editor.snapToGrid',
                    label: 'Snap to Grid',
                    description: 'Automatically snap nodes to the nearest grid intersection when dragging.',
                    type: 'toggle'
                },
                {
                    key: 'editor.gridSize',
                    label: 'Grid Size',
                    description: 'The distance between grid lines in pixels.',
                    type: 'number',
                    min: 10,
                    max: 100
                }
            ]
        },
        {
            id: 'display',
            title: 'Display',
            description: 'Control the visibility of editor aids.',
            settings: [
                {
                    key: 'editor.minimap',
                    label: 'Minimap',
                    description: 'Show a miniature overview of the entire graph for quick navigation.',
                    type: 'toggle'
                }
            ]
        }
    ]
};
