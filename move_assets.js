const fs = require('fs');
const path = require('path');
const oldPath = path.join(__dirname, 'frontend', 'assets');
const newPath = path.join(__dirname, 'frontend', 'src', 'assets');
try {
    if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
        console.log("Moved assets to src/assets");
    }
} catch (e) {
    console.log(e);
}
