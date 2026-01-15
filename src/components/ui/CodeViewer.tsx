import Editor, { loader, type OnMount } from "@monaco-editor/react";
import * as monaco from "monaco-editor";

// Force local monaco instance (No CDN, No Electron require issues)
loader.config({ monaco });
import React, { useRef } from "react";

interface CodeViewerProps {
    code: string;
    language: string;
    height?: string | number;
    showLineNumbers?: boolean;
    showMinimap?: boolean;
    className?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
    code,
    language,
    height = "100%",
    showLineNumbers = true,
    showMinimap = true,
    className = ""
}) => {
    const editorRef = useRef<any>(null);

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;

        // Define a custom theme that matches the app's UI
        monaco.editor.defineTheme('railgun-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: '', foreground: '#c9d1d9' }, // Default text
                { token: 'comment', foreground: '#8b949e', fontStyle: 'italic' },
                { token: 'keyword', foreground: '#ff7b72' }, // Red-orange for keywords
                { token: 'keyword.control', foreground: '#ff7b72' },
                { token: 'keyword.operator', foreground: '#ff7b72' },
                { token: 'string', foreground: '#a5d6ff' }, // Light blue for strings
                { token: 'number', foreground: '#f2cc60' }, // Gold for numbers
                { token: 'identifier', foreground: '#c9d1d9' },
                { token: 'type', foreground: '#ffa657' }, // Orange for types/classes
                { token: 'function', foreground: '#d2a8ff' }, // Purple for functions
                { token: 'delimiter', foreground: '#8b949e' },
                { token: 'property', foreground: '#79c0ff' }, // Sky blue for properties
                { token: 'constant', foreground: '#ff7b72' }, // null, true, etc
                { token: 'tag', foreground: '#7ee787' },
                { token: 'variable', foreground: '#ffa657' },
                { token: 'variable.predefined', foreground: '#d2a8ff' },
                { token: 'attribute.name', foreground: '#79c0ff' },
            ],
            colors: {
                'editor.background': '#161619',
                'editor.lineHighlightBackground': '#1c1c20',
                'editorLineNumber.foreground': '#484f58',
                'editorLineNumber.activeForeground': '#8b949e',
                'editor.selectionBackground': '#388bfd33',
                'editorIndentGuide.background': '#30363d55',
                'editorIndentGuide.activeBackground': '#30363d',
                'editor.inactiveSelectionBackground': '#388bfd11',
                'editorCursor.foreground': '#58a6ff',
                'editor.selectionHighlightBackground': '#2c313a',
            }
        });

        monaco.editor.setTheme('railgun-dark');
    };

    return (
        <div className={`w-full h-full overflow-hidden ${className}`}>
            <Editor
                height={height}
                defaultLanguage={language}
                language={language}
                value={code}
                theme="railgun-dark"
                options={{
                    readOnly: true,
                    domReadOnly: true, // Prevent typing
                    minimap: { enabled: showMinimap },
                    lineNumbers: showLineNumbers ? "on" : "off",
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 24, bottom: 16 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    fontSize: 13,
                    renderWhitespace: "selection",
                    contextmenu: false, // Disable right-click menu for cleaner "viewer" feel
                    lineHeight: 20,
                    letterSpacing: 0.5,
                    scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                    }
                }}
                onMount={handleEditorDidMount}
            />
        </div>
    );
};
