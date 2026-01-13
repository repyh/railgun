import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { SettingsTabRegistry } from './SettingsTabRegistry';
import { ChevronLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Import Core Definitions
import { GeneralSettingsDef } from './tabs/GeneralSettingsDef';
import { EditorSettingsDef } from './tabs/EditorSettingsDef';
import { RPCSettingsDef } from './tabs/RPCSettingsDef';

// Register Core Tabs (Data-Driven Migration)
SettingsTabRegistry.register(GeneralSettingsDef);
SettingsTabRegistry.register(EditorSettingsDef);
SettingsTabRegistry.register(RPCSettingsDef);

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { settings, resetSettings } = useSettings();
    const [activeTabId, setActiveTabId] = useState<string>('general');
    const [searchQuery, setSearchQuery] = useState('');

    const stationId = settings.system?.stationId || 'INITIALIZING...';
    const tabs = SettingsTabRegistry.getTabs();

    // Simple filter for sidebar categories
    const filteredTabs = tabs.filter(tab =>
        tab.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tab.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeTab = tabs.find(t => t.id === activeTabId);
    const ActiveComponent = activeTab?.component || (() => <div>Not Found</div>);

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            resetSettings();
        }
    };

    return (
        <div className="flex h-full bg-background animate-in fade-in zoom-in-95 duration-200">
            {/* Sidebar */}
            <div className="w-64 shrink-0 border-r border-zinc-800 bg-zinc-900/30 flex flex-col">
                <div className="h-12 flex items-center px-4 border-b border-zinc-800 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="mr-2 h-7 w-7 text-zinc-500 hover:text-white"
                        title="Back to Dashboard"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm truncate text-zinc-200 mt-1">Settings</div>
                        <div className="text-[10px] text-zinc-500 font-mono truncate uppercase tracking-tighter">Configuration</div>
                    </div>
                </div>

                <div className="flex-1 overflow-auto p-2">
                    <div className="px-2">
                        <div className="relative mb-4 group">
                            <Search className="absolute left-2 top-2 text-zinc-600 group-focus-within:text-blue-500 transition-colors" size={12} />
                            <input
                                type="text"
                                placeholder="Search settings..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-zinc-950/50 border border-zinc-800 rounded px-7 py-2 text-xs text-zinc-300 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <h3 className="text-[10px] uppercase font-bold text-zinc-600 mb-2 px-1">Categories</h3>
                        <div className="space-y-0.5">
                            {filteredTabs.map(tab => {
                                const isActive = activeTabId === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTabId(tab.id)}
                                        className={`flex items-center w-full group rounded select-none px-2 py-2 text-xs transition-all ${isActive
                                            ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500 pl-3'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 pl-2'
                                            }`}
                                    >
                                        <span className="truncate font-medium">{tab.label}</span>
                                    </button>
                                );
                            })}
                            {filteredTabs.length === 0 && (
                                <div className="text-[10px] text-zinc-600 px-2 py-4 italic">No categories match your search</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Anchored to bottom */}
                <div className="p-4 border-t border-zinc-800/50 text-[10px] text-zinc-600 leading-relaxed opacity-60">
                    <p className="font-mono text-zinc-500 leading-none mb-1.5 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                        ID: {stationId}::{activeTabId.toUpperCase()}
                    </p>
                    <p>Railgun IDE Settings v0.1.0</p>
                    <p>© 2026 Railgun Team</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden">
                {/* Internal Header */}
                <div className="h-12 flex items-center justify-between px-8 border-b border-zinc-800/50 bg-zinc-900/10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-sm font-semibold text-zinc-100">{activeTab?.label}</h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-[10px] h-7 px-3 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/20"
                    >
                        Reset Defaults
                    </Button>
                </div>

                {/* Content Viewport */}
                <div className="flex-1 relative overflow-y-auto custom-scrollbar">
                    <div className="max-w-4xl mx-auto py-10 px-10">
                        <ActiveComponent />
                    </div>
                </div>
            </div>
        </div>
    );
};


export default SettingsPage;
