import React from 'react';
import type { ValidationIssue } from '@/lib/validation/types';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

interface ProblemsPanelProps {
    issues: ValidationIssue[];
    onClose: () => void;
    onJumpToNode: (nodeId: string) => void;
    isVisible: boolean;
}

export const ProblemsPanel: React.FC<ProblemsPanelProps> = ({ issues, onClose, onJumpToNode, isVisible }) => {
    if (!isVisible) return null;

    const errors = issues.filter(i => i.severity === 'error');
    const warnings = issues.filter(i => i.severity === 'warning');

    return (
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-zinc-900 border-t border-zinc-800 flex flex-col z-50 animate-in slide-in-from-bottom-5 font-sans text-xs">
            {/* Header */}
            <div className="h-9 px-4 flex items-center justify-between bg-zinc-900 border-b border-zinc-800 select-none">
                <div className="flex items-center space-x-4">
                    <span className="font-semibold text-zinc-300 text-[11px]">Problems</span>
                    <div className="flex space-x-2 text-[10px]">
                        <span className="flex items-center text-red-500">
                            <AlertCircle size={12} className="mr-1" /> {errors.length}
                        </span>
                        <span className="flex items-center text-yellow-500">
                            <AlertTriangle size={12} className="mr-1" /> {warnings.length}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-0 scrollbar-hide text-zinc-400">
                {issues.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600">
                        <span>No problems detected. Nice!</span>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-zinc-900 text-zinc-500 font-medium z-10">
                            <tr>
                                <th className="p-2 pl-4 w-12 text-center border-b border-zinc-800"></th>
                                <th className="p-2 w-32 border-b border-zinc-800">Rule</th>
                                <th className="p-2 border-b border-zinc-800">Description</th>
                                <th className="p-2 w-48 border-b border-zinc-800">Source</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map((issue) => (
                                <tr
                                    key={issue.id}
                                    onClick={() => onJumpToNode(issue.nodeId)}
                                    className="border-b border-zinc-800/30 hover:bg-zinc-800/50 cursor-pointer group transition-colors"
                                >
                                    <td className="p-2 pl-4 text-center">
                                        {issue.severity === 'error' ? (
                                            <AlertCircle size={14} className="text-red-500" />
                                        ) : (
                                            <AlertTriangle size={14} className="text-yellow-500" />
                                        )}
                                    </td>
                                    <td className="p-2 text-zinc-400 group-hover:text-zinc-300 font-mono text-xs">{issue.ruleId}</td>
                                    <td className="p-2 text-zinc-300 group-hover:text-white">{issue.message}</td>
                                    <td className="p-2 text-zinc-500 group-hover:text-zinc-300 text-[10px] font-mono">
                                        {issue.nodeLabel} <span className="opacity-40">({issue.nodeId.substring(0, 8)})</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};
