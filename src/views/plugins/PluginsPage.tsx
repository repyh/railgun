import React from 'react';
import { Package } from 'lucide-react';

const PluginsPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background text-zinc-100 animate-in fade-in duration-500">
            <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/5 transition-transform hover:scale-110 duration-300">
                    <Package size={40} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Plugin Marketplace</h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    The marketplace is currently being prepared. Soon you'll be able to browse, install, and manage official and community-made plugins for Railgun.
                </p>
                <div className="flex flex-col gap-3">
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest block mb-1">Coming Soon</span>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Support for shared plugin registries and local plugin development environments.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PluginsPage;