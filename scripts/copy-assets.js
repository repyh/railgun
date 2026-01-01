const fs = require('fs');
const path = require('path');

// Ensure dist-electron exists
if (!fs.existsSync(path.join(__dirname, '../dist-electron'))) {
    fs.mkdirSync(path.join(__dirname, '../dist-electron'), { recursive: true });
}

// Copy splash.html
fs.copyFileSync(
    path.join(__dirname, '../electron/splash.html'),
    path.join(__dirname, '../dist-electron/splash.html')
);

// Copy resources directory to dist-electron for splash screen
const srcRes = path.join(__dirname, '../public/resources');
const destRes = path.join(__dirname, '../dist-electron/resources');

if (fs.existsSync(srcRes)) {
    if (!fs.existsSync(destRes)) {
        fs.mkdirSync(destRes, { recursive: true });
    }

    // Simple recursive copy for specific directory
    const files = fs.readdirSync(srcRes);
    for (const file of files) {
        fs.copyFileSync(path.join(srcRes, file), path.join(destRes, file));
    }
    console.log('Copied resources to dist-electron/resources');
}

console.log('Copied splash.html to dist-electron');
