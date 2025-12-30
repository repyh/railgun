import type { CommandDefinition } from './commands/CommandDefinition';
import { LegacyCommand } from './commands/LegacyCommand';

class CommandRegistry {
    private commands: Map<string, CommandDefinition> = new Map();

    constructor() {
        this.register(LegacyCommand);
    }

    register(command: CommandDefinition) {
        this.commands.set(command.id, command);
    }

    get(id: string): CommandDefinition | undefined {
        return this.commands.get(id);
    }

    getAll(): CommandDefinition[] {
        return Array.from(this.commands.values());
    }

    generateContent(id: string, uuid: string, args: any[] = []): any {
        const command = this.get(id);
        if (!command) throw new Error(`Command type ${id} not found`);
        return command.defaultContent(uuid, args);
    }
}

export const commandRegistry = new CommandRegistry();
