const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../electron/splash.html');
const dest = path.join(__dirname, '../dist-electron/splash.html');

// Ensure dist-electron exists
const destDir = path.dirname(dest);
if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(src, dest);
console.log('Copied splash.html to dist-electron');
