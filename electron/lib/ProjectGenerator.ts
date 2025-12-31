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

        // project.railgun
        const goldenGraphNodes = [
            {
                "inputs": {},
                "outputs": {
                    "exec": {
                        "socket": {
                            "name": "Exec"
                        },
                        "label": "Exec",
                        "multipleConnections": true,
                        "id": "bf4a41bf5b0bdaa7"
                    },
                    "client": {
                        "socket": {
                            "name": "Any"
                        },
                        "label": "Client",
                        "multipleConnections": true,
                        "id": "7318838d0ae497db"
                    }
                },
                "controls": {},
                "label": "On Ready",
                "id": "root",
                "category": "Event",
                "codeType": "On Ready",
                "data": {
                    "eventType": "clientReady",
                    "nodeType": "On Ready"
                },
                "height": 120,
                "width": 200,
                "x": 0,
                "y": 0
            },
            {
                "inputs": {
                    "exec": {
                        "socket": {
                            "name": "Exec"
                        },
                        "label": "Exec",
                        "id": "ad4a676ec46881b9",
                        "control": null,
                        "showControl": true
                    },
                    "msg": {
                        "socket": {
                            "name": "Any"
                        },
                        "label": "Message",
                        "id": "f8d32a83ee5a4605",
                        "control": {
                            "id": "f9bcb1cf8b4c5e30",
                            "value": "",
                            "label": "msg",
                            "type": "text",
                            "initial": ""
                        },
                        "showControl": true
                    }
                },
                "outputs": {
                    "exec_out": {
                        "socket": {
                            "name": "Exec"
                        },
                        "label": "Then",
                        "multipleConnections": true,
                        "id": "d25a4eaa6890ad89"
                    }
                },
                "controls": {},
                "label": "Console Log",
                "id": "8d72aedbc30dcf0f",
                "category": "Action",
                "codeType": "Console Log",
                "data": {},
                "height": 120,
                "width": 200,
                "selected": false,
                "x": 742.5966623677942,
                "y": 0.11104555411665062
            },
            {
                "inputs": {
                    "object": {
                        "socket": {
                            "name": "Any"
                        },
                        "label": "Object",
                        "id": "dce0858dc21c86a8",
                        "control": null,
                        "showControl": true
                    }
                },
                "outputs": {
                    "value": {
                        "socket": {
                            "name": "Any"
                        },
                        "label": "Value",
                        "multipleConnections": true,
                        "id": "99239fa4abae74c9"
                    }
                },
                "controls": {
                    "property": {
                        "id": "d63dc0f8d6dd9a86",
                        "value": "user.tag",
                        "label": "Property Path",
                        "type": "text",
                        "initial": ""
                    }
                },
                "label": "Get Property",
                "id": "880d39444477a127",
                "category": "Variable",
                "codeType": "Get Property",
                "data": {},
                "height": 120,
                "width": 200,
                "selected": false,
                "x": 240.207287785954,
                "y": 242.41474798560478
            },
            {
                "inputs": {},
                "outputs": {
                    "output": {
                        "socket": {
                            "name": "String"
                        },
                        "label": "Value",
                        "multipleConnections": true,
                        "id": "ff8098f254d293e0"
                    }
                },
                "controls": {
                    "value": {
                        "id": "d452cac2d6ae430d",
                        "value": "Logged in as ",
                        "label": "Value",
                        "type": "text",
                        "initial": ""
                    }
                },
                "label": "String",
                "id": "7cef4e3dc8478e4c",
                "category": "Variable",
                "codeType": "String",
                "data": {},
                "height": 120,
                "width": 200,
                "selected": false,
                "x": 240.78941453946973,
                "y": 118.01139182779276
            },
            {
                "inputs": {
                    "a": {
                        "socket": {
                            "name": "Number"
                        },
                        "label": "A",
                        "id": "e4416289e44d1c54",
                        "control": null,
                        "showControl": true
                    },
                    "b": {
                        "socket": {
                            "name": "Number"
                        },
                        "label": "B",
                        "id": "3986345ecaf629f9",
                        "control": null,
                        "showControl": true
                    }
                },
                "outputs": {
                    "value": {
                        "socket": {
                            "name": "Number"
                        },
                        "label": "Result",
                        "multipleConnections": true,
                        "id": "d7e203b8ff67e419"
                    }
                },
                "controls": {
                    "a_val": {
                        "id": "2e4ca16c3c0f30ba",
                        "value": "0",
                        "label": "A",
                        "type": "number",
                        "initial": "0"
                    },
                    "b_val": {
                        "id": "fb9204c4b7f83ca5",
                        "value": "0",
                        "label": "B",
                        "type": "number",
                        "initial": "0"
                    }
                },
                "label": "Add",
                "id": "d42ff55a373f3553",
                "category": "Math",
                "codeType": "Add",
                "data": {},
                "height": 120,
                "width": 200,
                "selected": false,
                "x": 505.89996337890625,
                "y": 148.60006713867188
            }
        ];

        const goldenGraphConnections = [
            {
                "id": "0c4f3916834c31c9",
                "source": "root",
                "sourceOutput": "exec",
                "target": "8d72aedbc30dcf0f",
                "targetInput": "exec"
            },
            {
                "id": "ee28fac48e2d2fe6",
                "source": "root",
                "sourceOutput": "client",
                "target": "880d39444477a127",
                "targetInput": "object"
            },
            {
                "id": "0ccef9997aedc3a8",
                "source": "7cef4e3dc8478e4c",
                "sourceOutput": "output",
                "target": "d42ff55a373f3553",
                "targetInput": "a"
            },
            {
                "id": "0c0f1c9da185b172",
                "source": "880d39444477a127",
                "sourceOutput": "value",
                "target": "d42ff55a373f3553",
                "targetInput": "b"
            },
            {
                "id": "03784008554bbf20",
                "source": "d42ff55a373f3553",
                "sourceOutput": "value",
                "target": "8d72aedbc30dcf0f",
                "targetInput": "msg"
            }
        ];

        const railgunProject = {
            "name": options.name,
            "version": "1.0.0",
            "railgunVersion": "1.0.0",
            "prefix": "!",
            "gatewayIntents": [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ],
            "nodes": goldenGraphNodes,
            "connections": goldenGraphConnections
        };
        await fs.writeFile(path.join(projectPath, 'project.railgun'), JSON.stringify(railgunProject, null, 2));

        // bot.js (Pre-compiled Golden Graph)
        const botJs = `const { Events } = require('discord.js');

module.exports = (client) => {
    // Generated by Railgun (Standard Template)
    
    // Event: On Ready
    client.once(Events.ClientReady, async (client) => {
        // Action: Console Log
        console.log(\`Logged in as \${options.name}!\`);
    });
};
`;
        await fs.writeFile(path.join(projectPath, 'bot.js'), botJs);

        // index.js
        const indexJs = `require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load Config from project.railgun (JSON parse as Node doesn't native load .railgun)
const projectConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'project.railgun'), 'utf-8'));

const client = new Client({
    intents: projectConfig.gatewayIntents || ['Guilds', 'GuildMessages', 'MessageContent'],
});

// Load Compiled Logic (bot.js)
// This file is generated by the Railgun Compiler
try {
    require('./bot.js')(client);
} catch (err) {
    console.error("Failed to load bot logic (bot.js):", err);
}

// Load Handlers (Legacy Support for manual handlers)
const handlersPath = path.join(__dirname, 'handlers');
if (fs.existsSync(handlersPath)) {
    const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));
    for (const file of handlerFiles) {
        require(\`./handlers/\${file}\`)(client);
    }
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
