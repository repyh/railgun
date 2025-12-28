const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

module.exports = async (client) => {
    const slashCommands = [];
    client.slashCommands = new Map(); // Store commands in client for execution

    const slashCommandsPath = path.join(__dirname, '../slashCommands');

    // Read category folders
    const commandFolders = fs.readdirSync(slashCommandsPath).filter(file => fs.statSync(path.join(slashCommandsPath, file)).isDirectory());

    for (const folder of commandFolders) {
        const commandsPath = path.join(slashCommandsPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const command = require(filePath);

            // Check for 'data' and ('execute' OR 'run')
            // Railgun Compiler generates 'run', standard templates use 'execute'
            if ('data' in command && ('execute' in command || 'run' in command)) {
                client.slashCommands.set(command.data.name, command);
                slashCommands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute/run" property.`);
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

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log(`Started refreshing ${slashCommands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: slashCommands },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};
