try {
    console.log('Resolved electron path:', require.resolve('electron'));
} catch (e) {
    console.log('Could not resolve "electron" path (might be built-in)');
}

const electron = require('electron');
console.log('Type of electron:', typeof electron);
if (typeof electron === 'string') {
    console.error('ERROR: require("electron") returned a string!');
    console.log('String value:', electron);
} else {
    console.log('SUCCESS: electron.app is', typeof electron.app);
    if (electron.app) electron.app.quit();
}
