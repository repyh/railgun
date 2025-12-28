const { Events } = require('discord.js');
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
