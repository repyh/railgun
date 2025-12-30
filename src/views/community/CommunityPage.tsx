import React from 'react';
import { Globe, LayoutGrid, Heart } from 'lucide-react';

const CommunityPage: React.FC = () => {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background text-zinc-100 animate-in fade-in duration-500">
            <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-500/5 transition-transform hover:scale-110 duration-300">
                    <Globe size={40} className="text-purple-500" />
                </div>
                <h2 className="text-2xl font-semibold mb-2">Community & Templates</h2>
                <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                    Discover pre-made blueprints, community templates, and logic snippets to accelerate your bot development.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <LayoutGrid size={14} className="text-purple-400" />
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Featured Templates</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Browse shared projects from the Railgun community.
                        </p>
                    </div>

                    <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-left">
                        <div className="flex items-center gap-2 mb-1">
                            <Heart size={14} className="text-purple-400" />
                            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">Shared Logic</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Logic snippets for common Discord features like moderation, music, and leveling.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
