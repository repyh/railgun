module.exports = {
    name: 'ping',
    description: 'Replies with Pong!',
    aliases: ['p'],
    execute(message, args) {
        message.reply('Pong!');
    },
};
