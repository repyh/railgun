const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const eventsPath = path.join(__dirname, '../events');
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
    
    // Support for subdirectories in events folder (optional, but good for "advanced" feel)
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
