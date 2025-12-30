import * as fs from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface RecentProject {
    name: string;
    path: string;
    lastOpened: number; // Timestamp
}

export class HistoryManager {
    private static readonly FILE_NAME = 'recent_projects.json';
    private static readonly MAX_ITEMS = 10;

    private static getStoragePath(): string {
        return path.join(app.getPath('userData'), this.FILE_NAME);
    }

    /**
     * Retrieves the list of recent projects, sorted by last opened date.
     */
    static async getRecent(): Promise<RecentProject[]> {
        const filePath = this.getStoragePath();
        if (!existsSync(filePath)) {
            return [];
        }

        try {
            const data = await fs.readFile(filePath, 'utf-8');
            const projects: RecentProject[] = JSON.parse(data);
            return projects.sort((a, b) => b.lastOpened - a.lastOpened);
        } catch (error) {
            console.error('Failed to read recent projects history:', error);
            return [];
        }
    }

    /**
     * Adds a project to the recent list, or updates it if it already exists.
     */
    static async addToRecent(name: string, projectPath: string): Promise<void> {
        let projects = await this.getRecent();

        // Remove if already exists to move to top
        projects = projects.filter(p => p.path !== projectPath);

        // Add to the beginning
        projects.unshift({
            name,
            path: projectPath,
            lastOpened: Date.now()
        });

        // Limit size
        if (projects.length > this.MAX_ITEMS) {
            projects = projects.slice(0, this.MAX_ITEMS);
        }

        await this.save(projects);
    }

    /**
     * Removes a project from the recent list.
     */
    static async removeFromRecent(projectPath: string): Promise<void> {
        let projects = await this.getRecent();
        projects = projects.filter(p => p.path !== projectPath);
        await this.save(projects);
    }

    /**
     * Clears all recent projects.
     */
    static async clearRecent(): Promise<void> {
        await this.save([]);
    }

    private static async save(projects: RecentProject[]): Promise<void> {
        try {
            const filePath = this.getStoragePath();
            await fs.writeFile(filePath, JSON.stringify(projects, null, 2), 'utf-8');
        } catch (error) {
            console.error('Failed to save recent projects history:', error);
        }
    }
}
