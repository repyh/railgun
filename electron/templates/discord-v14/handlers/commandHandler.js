const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.commands = new Map();
    client.aliases = new Map();

    const commandsPath = path.join(__dirname, '../commands');

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
