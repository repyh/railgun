import { useEffect } from 'react';

// Simplified interface: The editor instance handles the logic.
interface EditorContext {
    undo: () => void;
    redo: () => void;
    copy: () => Promise<void>;
    paste: () => Promise<void>;
    duplicate: () => Promise<void>;
    delete: () => Promise<void>;
    save: () => Promise<void>;
}

export function useEditorShortcuts(
    context: EditorContext | null,
    enabled: boolean = true
) {
    useEffect(() => {
        if (!enabled || !context) return;

        const { undo, redo, copy, paste, duplicate, delete: deleteSelection, save } = context;

        const handleKeyDown = async (e: KeyboardEvent) => {
            // Guard: Ignore if typing in an input, textarea, or contenteditable
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.isContentEditable
            ) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;

            if (isMod) {
                const code = e.code;

                try {
                    switch (code) {
                        case 'KeyZ':
                            e.preventDefault();
                            if (e.shiftKey) {
                                redo();
                            } else {
                                undo();
                            }
                            break;
                        case 'KeyY':
                            e.preventDefault();
                            redo();
                            break;
                        case 'KeyC':
                            e.preventDefault();
                            await copy();
                            break;
                        case 'KeyV':
                            e.preventDefault();
                            await paste();
                            break;
                        case 'KeyD':
                            e.preventDefault();
                            await duplicate();
                            break;
                        case 'KeyS':
                            e.preventDefault();
                            await save();
                            break;
                    }
                } catch (err) {
                    console.error(`[useEditorShortcuts] Operation ${code} failed:`, err);
                }
            } else {
                // Non-modifier keys
                if (e.code === 'Delete' || e.code === 'Backspace') {
                    e.preventDefault();
                    deleteSelection().catch(err => {
                        console.error("[useEditorShortcuts] Delete failed:", err);
                    });
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [context, enabled]);
}
