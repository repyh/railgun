import React, { useEffect, useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PackagesTabProps {
    projectPath: string;
}

interface PackageJson {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
}

const PROTECTED_PACKAGES = ['discord.js', 'dotenv', 'nodemon'];

export const PackagesTab: React.FC<PackagesTabProps> = ({ projectPath }) => {
    const [packageJson, setPackageJson] = useState<PackageJson | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [newPackage, setNewPackage] = useState('');
    const [isDev, setIsDev] = useState(false);
    const [uninstalling, setUninstalling] = useState<string | null>(null);

    const loadPackages = async () => {
        if (!projectPath || !window.electronAPI) return;
        setIsLoading(true);
        try {
            const data = await window.electronAPI.readPackageJson(projectPath);
            setPackageJson(data);
        } catch (error) {
            console.error('Failed to load package.json', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPackages();
    }, [projectPath]);

    const handleInstall = async () => {
        if (!newPackage.trim() || !window.electronAPI) return;
        setInstalling(true);
        try {
            // We assume successful return means started, but we might want to wait or listen to terminal
            // For now, we just trigger it and maybe refresh after a delay or rely on user refreshing
            await window.electronAPI.installPackage(projectPath, newPackage, isDev);
            setNewPackage('');
            // Refresh after a delay to allow install to write to package.json (approximate)
            setTimeout(loadPackages, 5000);
        } catch (error) {
            console.error('Failed to install package', error);
        } finally {
            setInstalling(false);
        }
    };

    const handleUninstall = async (packageName: string) => {
        if (!window.electronAPI || uninstalling) return;
        setUninstalling(packageName);
        try {
            await window.electronAPI.uninstallPackage(projectPath, packageName);
            setTimeout(loadPackages, 5000);
        } catch (error) {
            console.error('Failed to uninstall package', error);
        } finally {
            setUninstalling(null);
        }
    };

    const depList = packageJson?.dependencies ? Object.entries(packageJson.dependencies) : [];
    const devDepList = packageJson?.devDependencies ? Object.entries(packageJson.devDependencies) : [];

    const renderPackageList = (list: [string, string][]) => {
        if (list.length === 0) {
            return <div className="text-zinc-600 text-sm italic">No packages installed.</div>;
        }
        return list.map(([name, version]) => {
            const isProtected = PROTECTED_PACKAGES.includes(name);
            const isUninstalling = uninstalling === name;

            return (
                <div
                    key={name}
                    className={`flex items-center justify-between p-3 rounded-md border border-zinc-800 transition-colors ${isProtected ? 'bg-zinc-900/10 border-zinc-800/50 opacity-60' : 'bg-zinc-900/30 hover:bg-zinc-900/50'
                        }`}
                >
                    <div>
                        <div className={`font-medium ${isProtected ? 'text-zinc-500' : 'text-zinc-200'}`}>
                            {name}
                            {isProtected && <span className="ml-2 text-xs border border-zinc-700 rounded px-1.5 py-0.5 text-zinc-600">Core</span>}
                        </div>
                        <div className="text-xs text-zinc-500">{version}</div>
                    </div>
                    {!isProtected && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-400/10 h-8 w-8"
                            onClick={() => handleUninstall(name)}
                            disabled={isUninstalling || isLoading}
                        >
                            {isUninstalling ? <RefreshCw className="animate-spin" size={14} /> : <Trash2 size={16} />}
                        </Button>
                    )}
                </div>
            );
        });
    }

    return (
        <div className="h-full w-full p-6 overflow-auto bg-background">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header & Actions */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-zinc-100 mb-1">Packages</h2>
                        <p className="text-zinc-500 text-sm">Manage dependencies for your project.</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadPackages} disabled={isLoading}>
                        <RefreshCw size={14} className={isLoading ? "animate-spin mr-2" : "mr-2"} />
                        Refresh
                    </Button>
                </div>

                {/* Install New Package */}
                <Card className="bg-zinc-900/50 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-300">Install New Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Package name (e.g. discord.js)"
                                value={newPackage}
                                onChange={(e) => setNewPackage(e.target.value)}
                                className="bg-zinc-950 border-zinc-800 flex-1"
                            />
                            <label className="flex items-center gap-2 text-sm text-zinc-400 select-none cursor-pointer hover:text-zinc-200 transition-colors border border-zinc-700 rounded-md px-3 h-10 hover:bg-zinc-800 bg-zinc-900/50">
                                <input
                                    type="checkbox"
                                    checked={isDev}
                                    onChange={(e) => setIsDev(e.target.checked)}
                                    className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-offset-0 focus:ring-blue-500/50 h-4 w-4"
                                />
                                Save as Dev Dependency
                            </label>
                            <Button onClick={handleInstall} disabled={installing || !newPackage}>
                                {installing ? 'Installing...' : 'Install'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6">
                    {/* Dependencies */}
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            Dependencies
                            <Badge variant="secondary" className="text-xs">{depList.length}</Badge>
                        </h3>
                        <div className="grid gap-2">
                            {renderPackageList(depList)}
                        </div>
                    </div>

                    {/* Dev Dependencies */}
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            Dev Dependencies
                            <Badge variant="secondary" className="text-xs">{devDepList.length}</Badge>
                        </h3>
                        <div className="grid gap-2">
                            {renderPackageList(devDepList)}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
