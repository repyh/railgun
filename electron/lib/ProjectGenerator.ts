import * as fs from 'fs/promises';
import * as path from 'path';
import { Compiler } from '../../src/lib/compiler/Compiler';
import { ReactFlowAdapter } from '../../src/lib/adapter/ReactFlowAdapter';

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
        const srcPath = path.join(projectPath, 'src');
        await fs.mkdir(srcPath, { recursive: true });
        await fs.mkdir(path.join(srcPath, 'commands'), { recursive: true });
        await fs.mkdir(path.join(srcPath, 'events'), { recursive: true });
        await fs.mkdir(path.join(projectPath, '.railgun'), { recursive: true });

        // 2. Write Files

        // --- Root Files ---

        // package.json
        const packageJson = {
            name: options.name,
            version: "1.0.0",
            description: "",
            main: "src/index.js",
            scripts: {
                start: options.runtime === 'bun' ? "bun run src/index.js" : "node src/index.js",
                dev: options.runtime === 'bun' ? "bun run --watch src/index.js" : "nodemon src/index.js"
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
        await fs.writeFile(path.join(projectPath, '.gitignore'), `node_modules\n.env\ndist\n.railgun/temp\n`);

        // .env
        await fs.writeFile(path.join(projectPath, '.env'), `DISCORD_TOKEN=\nCLIENT_ID=\n`);

        const railgunProject = {
            "name": options.name,
            "version": "1.0.0",
            "railgunVersion": "1.1.0",
            "prefix": "!",
            "directories": {
                "src": "src",
                "commands": "src/commands",
                "events": "src/events"
            },
            "gatewayIntents": [
                "Guilds",
                "GuildMessages",
                "MessageContent"
            ]
        };
        await fs.writeFile(path.join(projectPath, 'railgun.config.json'), JSON.stringify(railgunProject, null, 2));

        // src/index.js
        const indexJs = `require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 1. Load Config
const configPath = path.join(__dirname, '../railgun.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// 2. Initialize Client
const client = new Client({
    intents: config.gatewayIntents.map(i => GatewayIntentBits[i])
});

client.commands = new Collection();
client.slashCommands = new Collection();

// 3. Load Handlers
async function bootstrap() {
    // Load Commands
    const commandsPath = path.join(__dirname, 'commands');
    if (fs.existsSync(commandsPath)) {
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            if (command.data) {
                client.slashCommands.set(command.data.name, command);
            } else if (command.name) {
                client.commands.set(command.name, command);
            }
        }
    }

    // Load Events
    const eventsPath = path.join(__dirname, 'events');
    if (fs.existsSync(eventsPath)) {
        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(path.join(eventsPath, file));
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }

    // Optional: Register Slash Commands
    if (process.env.DISCORD_TOKEN && process.env.CLIENT_ID && client.slashCommands.size > 0) {
        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            const body = client.slashCommands.map(c => c.data.toJSON());
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body });
            console.log('Successfully registered slash commands.');
        } catch (error) {
            console.error('Failed to register slash commands:', error);
        }
    }

    // 4. Login
    client.login(process.env.DISCORD_TOKEN);
}

bootstrap();
`;
        await fs.writeFile(path.join(projectPath, 'src', 'index.js'), indexJs);

        // --- Events ---

        // onBotReady.railgun
        const readyGraphNodes = [
            { "inputs": {}, "outputs": {}, "controls": {}, "id": "root", "category": "Action", "data": { "_schemaId": "event/on-ready" }, "height": 120, "width": 200, "requiredInputs": {}, "validationMessages": {}, "x": 0, "y": 0, "type": "universal", "position": { "x": 100, "y": 100 }, "measured": { "width": 200, "height": 120 } }, { "inputs": {}, "outputs": {}, "controls": {}, "id": "7d591b2c-8d46-4435-bf2a-3b01d8a212e2", "category": "Action", "data": { "_schemaId": "variables/object-accessor", "property": "user.tag" }, "height": 120, "width": 200, "requiredInputs": {}, "validationMessages": {}, "x": 0, "y": 0, "type": "universal", "position": { "x": 400, "y": 240 }, "measured": { "width": 200, "height": 120 }, "selected": false, "dragging": false }, { "inputs": {}, "outputs": {}, "controls": {}, "id": "e13588ef-a7d4-4952-878e-6fb47934c4c8", "category": "Action", "data": { "_schemaId": "action/console-log" }, "height": 120, "width": 200, "requiredInputs": {}, "validationMessages": {}, "x": 0, "y": 0, "type": "universal", "position": { "x": 700, "y": 100 }, "measured": { "width": 200, "height": 120 }, "selected": false, "dragging": false }
        ];

        const readyGraphConnections = [
            { "style": { "strokeWidth": 2 }, "interactionWidth": 20, "reconnectable": true, "source": "root", "sourceHandle": "exec", "target": "e13588ef-a7d4-4952-878e-6fb47934c4c8", "targetHandle": "exec", "type": "vibrant", "animated": true, "data": { "color": "#ffffff" }, "id": "xy-edge__rootexec-e13588ef-a7d4-4952-878e-6fb47934c4c8exec" }, { "style": { "strokeWidth": 2 }, "interactionWidth": 20, "reconnectable": true, "source": "root", "sourceHandle": "client", "target": "7d591b2c-8d46-4435-bf2a-3b01d8a212e2", "targetHandle": "object", "type": "vibrant", "animated": false, "data": { "color": "#a1a1aa" }, "id": "xy-edge__rootclient-7d591b2c-8d46-4435-bf2a-3b01d8a212e2object" }, { "style": { "strokeWidth": 2 }, "interactionWidth": 20, "reconnectable": true, "source": "7d591b2c-8d46-4435-bf2a-3b01d8a212e2", "sourceHandle": "value", "target": "e13588ef-a7d4-4952-878e-6fb47934c4c8", "targetHandle": "msg", "type": "vibrant", "animated": false, "data": { "color": "#a1a1aa" }, "id": "xy-edge__7d591b2c-8d46-4435-bf2a-3b01d8a212e2value-e13588ef-a7d4-4952-878e-6fb47934c4c8msg" }
        ];

        await fs.writeFile(path.join(projectPath, '.railgun', 'onBotReady.railgun'), JSON.stringify({ nodes: readyGraphNodes, edges: readyGraphConnections }, null, 2));

        // Compile the starter graph
        try {
            const { nodes: reteNodes, connections: reteConnections } = ReactFlowAdapter.toCompilerData(readyGraphNodes, readyGraphConnections);
            const compiler = new Compiler({
                nodes: reteNodes,
                connections: reteConnections,
                fileType: 'event'
            });
            const compiledCode = compiler.compile();
            await fs.writeFile(path.join(projectPath, 'src', 'events', 'onBotReady.js'), compiledCode);
        } catch (err) {
            console.error("Failed to compile starter graph:", err);
        }

        // interactionCreate.js
        const interactionCreateJs = `const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const msg = { content: 'There was an error while executing this command!', ephemeral: true };
            if (interaction.replied || interaction.deferred) await interaction.followUp(msg);
            else await interaction.reply(msg);
        }
    },
};
`;
        await fs.writeFile(path.join(projectPath, 'src', 'events', 'interactionCreate.js'), interactionCreateJs);

        // messageCreate.js
        const messageCreateJs = `const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    async execute(message) {
        if (message.author.bot) return;
        
        // This is a placeholder for prefix commands if needed.
        // Railgun usually favors Slash Commands for modern bots.
    },
};
`;
        await fs.writeFile(path.join(projectPath, 'src', 'events', 'messageCreate.js'), messageCreateJs);
    }
}
