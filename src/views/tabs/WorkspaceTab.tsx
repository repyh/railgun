import React from 'react';
import { Layout } from 'lucide-react';

export const WorkspaceTab: React.FC = () => (
    <div className="h-full w-full flex items-center justify-center text-zinc-500">
        <div className="text-center">
            <Layout size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-2">Workspace</h3>
            <p className="text-sm">Select a file from the sidebar to edit.</p>
        </div>
    </div>
);
