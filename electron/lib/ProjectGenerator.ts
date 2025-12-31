import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProjectOptions {
    name: string;
    path: string;
    runtime: 'nodejs' | 'bun';
    template: string;
}

export class ProjectGenerator {

    static async generate(options: ProjectOptions): Promise<void> {
        const projectPath = path.join(options.path, options.name);

        // 1. Create Structure
        await fs.mkdir(projectPath, { recursive: true });
        await fs.mkdir(path.join(projectPath, 'commands'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'events'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'handlers'), { recursive: true });
        await fs.mkdir(path.join(projectPath, 'slashCommands'), { recursive: true });

        // 2. Write Files

        // --- Root Files ---

        // package.json
        const packageJson = {
            name: options.name,
            version: "1.0.0",
            description: "",
            main: "index.js",
            scripts: {
                start: options.runtime === 'bun' ? "bun run index.js" : "node index.js",
                dev: options.runtime === 'bun' ? "bun run --watch index.js" : "nodemon index.js"
            },
            keywords: [],
            author: "",
            license: "ISC",
            dependencies: {
                "discord.js": "^14.14.1",
                "dotenv": "^16.3.1"
            },
            devDependencies: options.runtime === 'nodejs' ? {
                "nodemon": "^3.0.2"
            } : {}
        };
        await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify(packageJson, null, 2));

        // .gitignore
        await fs.writeFile(path.join(projectPath, '.gitignore'), `node_modules\n.env\ndist\n`);

        // .env
        await fs.writeFile(path.join(projectPath, '.env'), `DISCORD_TOKEN=\nCLIENT_ID=\n`);

        // railgun.json
        const railgunJson = {
            "name": options.name,
            "version": "1.0.0",
            "railgunVersion": "1.0.0",
            "prefix": "!",
            "gatewayIntents": [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ]
        };
        await fs.writeFile(path.join(projectPath, 'railgun.json'), JSON.stringify(railgunJson, null, 2));

        // index.js
        const indexJs = `require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botmConfig = require('./railgun.json');

const client = new Client({
    intents: botmConfig.gatewayIntents || ['Guilds', 'GuildMessages', 'MessageContent'],
});

// Load Handlers
const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
    require(\`./handlers/\${file}\`)(client);
}

client.login(process.env.DISCORD_TOKEN);
`;
        await fs.writeFile(path.join(projectPath, 'index.js'), indexJs);


        // --- Handlers ---

        // commandHandler.js
        const commandHandler = `const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.commands = new Map();
    client.aliases = new Map();

    const commandsPath = path.join(__dirname, '../commands');

    if (!fs.existsSync(commandsPath)) return;

    // Read category folders
    const commandFolders = fs.readdirSync(commandsPath).filter(file => fs.statSync(path.join(commandsPath, file)).isDirectory());

    for (const folder of commandFolders) {
        const commandsPathFull = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(commandsPathFull).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPathFull, file);
            const command = require(filePath);

            if (command.name) {
                client.commands.set(command.name, command);

                if (command.aliases && Array.isArray(command.aliases)) {
                    command.aliases.forEach(alias => client.aliases.set(alias, command.name));
                }
            }
        }
    }

    // Also check root folder for commands not in categories
    const rootCommandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of rootCommandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if (command.name) {
            client.commands.set(command.name, command);
            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => client.aliases.set(alias, command.name));
            }
        }
    }
};
`;
        await fs.writeFile(path.join(projectPath, 'handlers', 'commandHandler.js'), commandHandler);

        // eventHandler.js
        const eventHandler = `const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    
    if (!fs.existsSync(eventsPath)) return;

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
    
    // Support for subdirectories in events folder
    const eventFolders = fs.readdirSync(eventsPath).filter(file => fs.statSync(path.join(eventsPath, file)).isDirectory());
    for (const folder of eventFolders) {
        const files = fs.readdirSync(path.join(eventsPath, folder)).filter(file => file.endsWith('.js'));
        for (const file of files) {
             const event = require(path.join(eventsPath, folder, file));
             if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
};
`;
        await fs.writeFile(path.join(projectPath, 'handlers', 'eventHandler.js'), eventHandler);

        // slashCommandHandler.js
        const slashCommandHandler = `const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = async (client) => {
    const slashCommands = [];
    client.slashCommands = new Map(); // Store commands in client for execution

    const slashCommandsPath = path.join(__dirname, '../slashCommands');
    
    if (!fs.existsSync(slashCommandsPath)) return;

    // Read category folders
    const commandFolders = fs.readdirSync(slashCommandsPath).filter(file => fs.statSync(path.join(slashCommandsPath, file)).isDirectory());

    for (const folder of commandFolders) {
        const commandsPath = path.join(slashCommandsPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Check for 'data' and ('execute' OR 'run')
            if ('data' in command && ('execute' in command || 'run' in command)) {
                client.slashCommands.set(command.data.name, command);
                slashCommands.push(command.data.toJSON());
            } else {
                console.log(\`[WARNING] The command at \${filePath} is missing a required "data" or "execute/run" property.\`);
            }
        }
    }

    // Also check root folder for commands not in categories
    const rootCommandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
    for (const file of rootCommandFiles) {
        const filePath = path.join(slashCommandsPath, file);
        const command = require(filePath);
        if ('data' in command && ('execute' in command || 'run' in command)) {
            client.slashCommands.set(command.data.name, command);
            slashCommands.push(command.data.toJSON());
        }
    }

    if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
        console.warn("Missing DISCORD_TOKEN or CLIENT_ID in .env, skipping command registration.");
        return;
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(\`Started refreshing \${slashCommands.length} application (/) commands.\`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: slashCommands },
        );

        console.log(\`Successfully reloaded \${data.length} application (/) commands.\`);
    } catch (error) {
        console.error(error);
    }
};
`;
        await fs.writeFile(path.join(projectPath, 'handlers', 'slashCommandHandler.js'), slashCommandHandler);

        // --- Events ---

        // ready.js
        const readyJs = `const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(\`Ready! Logged in as \${client.user.tag}\`);
    },
};
`;
        await fs.writeFile(path.join(projectPath, 'events', 'ready.js'), readyJs);

        // interactionCreate.js
        const interactionCreateJs = `const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.slashCommands.get(interaction.commandName);

        if (!command) {
            console.error(\`No command matching \${interaction.commandName} was found.\`);
            return;
        }

        try {
            if (command.run) {
                // Railgun Compiler format: run(client, interaction)
                await command.run(interaction.client, interaction);
            } else if (command.execute) {
                // Standard format: execute(interaction)
                await command.execute(interaction);
            }
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};
`;
        await fs.writeFile(path.join(projectPath, 'events', 'interactionCreate.js'), interactionCreateJs);

        // messageCreate.js
        const messageCreateJs = `const { Events } = require('discord.js');
const prefix = '!'; // Define prefix centrally or load from config

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot || !message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = message.client.commands.get(commandName) ||
            message.client.commands.get(message.client.aliases.get(commandName));

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply('There was an error executing that command.');
        }
    },
};
`;
        await fs.writeFile(path.join(projectPath, 'events', 'messageCreate.js'), messageCreateJs);
    }
}
