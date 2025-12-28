// This file patches the window.electronAPI object to map legacy method calls
// to the new modular IPC channels (fs:*, plugins:*, dependencies:*).
// This allows to refactor the backend without changing every frontend component.

const api = window.electronAPI as any;

if (api && api.invoke) {
    // FileSystemIPC
    api.saveFile = (projectPath: string, filePath: string, content: string) =>
        api.invoke('fs:write', projectPath, filePath, content);

    api.readFile = (projectPath: string, filePath: string) =>
        api.invoke('fs:read', projectPath, filePath);

    api.listFiles = (projectPath: string, directory: string) =>
        api.invoke('fs:list', projectPath, directory);

    api.deleteFile = (projectPath: string, filePath: string) =>
        api.invoke('fs:delete', projectPath, filePath);

    // PluginIPC
    api.installPlugin = (projectPath: string, pluginId: string) =>
        api.invoke('plugins:install', projectPath, pluginId);

    api.uninstallPlugin = (projectPath: string, pluginId: string) =>
        api.invoke('plugins:uninstall', projectPath, pluginId);

    api.listInstalledPlugins = (projectPath: string) =>
        api.invoke('plugins:listInstalled', projectPath);

    // DependencyIPC
    api.readPackageJson = (projectPath: string) =>
        api.invoke('dependencies:readPackageJson', projectPath);

    api.installDependencies = (projectPath: string, runtime: string) =>
        api.invoke('dependencies:installAll', projectPath, runtime);

    api.installPackage = (projectPath: string, packageName: string, dev: boolean) =>
        api.invoke('dependencies:install', projectPath, packageName, dev);

    api.uninstallPackage = (projectPath: string, packageName: string) =>
        api.invoke('dependencies:uninstall', projectPath, packageName);

    // ProjectIPC (Lifecycle - keep generic calls or map if needed)
    // Legacy mapping: project:createProject is already invoking 'project:createProject'
    // But since preload only exposes 'invoke', we need to restore the helper methods 
    // for symmetry if components call them directly.

    api.createProject = (data: any) => api.invoke('project:createProject', data);
    api.openProject = () => api.invoke('project:openProject');
    api.readProjectConfig = (path: string) => api.invoke('project:readProjectConfig', path);
    api.saveProjectConfig = (path: string, config: any) => api.invoke('project:saveProjectConfig', path, config);

    // SystemIPC
    api.minimizeWindow = () => api.invoke('system:minimizeWindow');
    api.toggleMaximizeWindow = () => api.invoke('system:maximizeWindow');
    api.closeWindow = () => api.invoke('system:closeWindow');
    api.selectDirectory = () => api.invoke('system:selectDirectory');

    // Terminal Data handler is already in preload as onTermData, but frontend might expect onTerminalData
    if (api.onTermData) {
        api.onTerminalData = api.onTermData;
    }

    console.log('[ElectronSetup] Patched window.electronAPI with modular IPC channels.');
} else {
    console.warn('[ElectronSetup] window.electronAPI not found or invoke missing. Patch failed.');
}

export { };
