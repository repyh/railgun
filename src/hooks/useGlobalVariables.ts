import { useState, useEffect, useCallback } from 'react';
import { useElectron } from './useElectron';

export interface GlobalVariable {
    id: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'any';
    defaultValue: any;
}

export const useGlobalVariables = (projectPath: string | null) => {
    const [variables, setVariables] = useState<GlobalVariable[]>([]);
    const { isElectron, files } = useElectron();

    const loadVariables = useCallback(async () => {
        if (!projectPath || !isElectron) return;

        try {
            // Read globals.json from the project root
            const content = await files.read(projectPath, 'globals.json');
            if (content) {
                try {
                    const json = JSON.parse(content);
                    if (Array.isArray(json)) {
                        setVariables(json);
                    } else {
                        setVariables([]);
                    }
                } catch (e) {
                    console.error("Failed to parse global variables", e);
                    setVariables([]);
                }
            } else {
                setVariables([]);
            }
        } catch (e) {
            console.error("Failed to load global variables", e);
            setVariables([]);
        }
    }, [projectPath, isElectron, files]);

    const saveVariables = useCallback(async (newVariables: GlobalVariable[]) => {
        if (!projectPath || !isElectron) return;

        try {
            await files.save(projectPath, 'globals.json', JSON.stringify(newVariables, null, 2));
            setVariables(newVariables);
        } catch (e) {
            console.error("Failed to save global variables", e);
        }
    }, [projectPath, isElectron, files]);

    const addVariable = (variable: GlobalVariable) => {
        saveVariables([...variables, variable]);
    };

    const updateVariable = (id: string, updates: Partial<GlobalVariable>) => {
        const newVars = variables.map(v => v.id === id ? { ...v, ...updates } : v);
        saveVariables(newVars);
    };

    const deleteVariable = (id: string) => {
        const newVars = variables.filter(v => v.id !== id);
        saveVariables(newVars);
    };

    useEffect(() => {
        loadVariables();
    }, [loadVariables]);

    return {
        variables,
        addVariable,
        updateVariable,
        deleteVariable,
        refresh: loadVariables
    };
};
