import React, { useMemo } from 'react';
import { useElectron } from '@/hooks/useElectron';
import { useSettings } from '@/contexts/SettingsContext';
import { ModalBuilder } from '@/components/ui/modal-builder/ModalBuilder';
import { type ModalSchema } from '@/lib/modal-builder/types';

interface CreateProjectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onCreateProject?: (name: string, path: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onOpenChange, onCreateProject }) => {
    const { isElectron, project } = useElectron();
    const { settings, updateSettings } = useSettings();

    const SCHEMA: ModalSchema = useMemo(() => ({
        id: 'create-project',
        title: 'Create New Project',
        description: 'Configure your new Discord bot project.',
        submitLabel: 'Create Project',
        size: 'md',
        fields: [
            {
                id: 'name',
                label: 'Project Name',
                type: 'text',
                required: true,
                placeholder: 'MyAwesomeBot'
            },
            {
                id: 'path',
                label: 'Location',
                type: 'path-browse',
                required: true,
                placeholder: 'Select a directory...'
            },
            {
                id: 'setDefault',
                label: 'Persistence',
                type: 'toggle',
                placeholder: 'Set as default project location',
                description: 'Future projects will start with this path.'
            },
            {
                id: 'runtime',
                label: 'Runtime',
                type: 'select',
                defaultValue: 'nodejs',
                options: [
                    { label: 'Node.js (v20+)', value: 'nodejs' },
                    { label: 'Bun (Experimental)', value: 'bun' }
                ]
            },
            {
                id: 'template',
                label: 'Template',
                type: 'select',
                defaultValue: 'typescript',
                options: [
                    { label: 'TypeScript (Recommended)', value: 'typescript' },
                    { label: 'JavaScript (CommonJS)', value: 'javascript' },
                    { label: 'Empty Project', value: 'empty' }
                ]
            }
        ]
    }), []);

    const initialData = useMemo(() => ({
        name: '',
        path: settings.system.defaultProjectPath || '',
        runtime: 'nodejs',
        template: 'typescript',
        setDefault: false
    }), [settings.system.defaultProjectPath, open]);

    const handleCreate = async (data: any) => {
        const { name, path, runtime, template, setDefault } = data;

        if (isElectron) {
            // Save as default if requested
            if (setDefault) {
                updateSettings('system', { defaultProjectPath: path });
            }

            const result = await project.create({
                name,
                path,
                runtime,
                template
            });

            if (result.success) {
                if (onCreateProject) {
                    const fullPath = result.message || path;
                    onCreateProject(name, fullPath);
                }
                onOpenChange(false);
            } else {
                console.error('Failed to create project:', result.message);
                // In a real app, show a toast here.
                alert('Failed to create project: ' + result.message);
            }
        }
    };

    return (
        <ModalBuilder
            schema={SCHEMA}
            open={open}
            onOpenChange={onOpenChange}
            onSubmit={handleCreate}
            initialData={initialData}
        />
    );
};
