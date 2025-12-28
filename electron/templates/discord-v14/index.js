require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botmConfig = require('./railgun.json');

const client = new Client({
    intents: botmConfig['config:editable'].gatewayIntents,
});

// Load Handlers
const handlersPath = path.join(__dirname, 'handlers');
const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

for (const file of handlerFiles) {
    require(`./handlers/${file}`)(client);
}

client.login(process.env.DISCORD_TOKEN);
