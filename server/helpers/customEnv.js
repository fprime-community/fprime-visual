const path = require('path')
const fs = require("fs");
var appDir = path.dirname(require.main.filename);
const checkAndSaveFolder = require('./checkFolder.js')

const nodemonEnv= process.argv.slice(2)
if (nodemonEnv.length !== 0){
    process.env.path = nodemonEnv[0];
} else {
    process.env.path = path.join(appDir, '/.fpv-env').replace('server/', '');
}

process.env.folders = ''; // not be undefined

const customEnv = () => {
    let file;
    try {
        file = fs.readFileSync(process.env.path, "utf8");
    } catch (err) {
        console.log('Invalid env file')
        process.exit();
        return
    }

    // Trim file and get each line as an array
    const lines = file.trim().split("\n");

    // For each line add a variable
    lines.forEach((line, index) => {
        // Trim line
        line = line.trim();

        // Only valid lines!
        const isComment = line[0] === "#";
        const isValid = line.match("=");        
        if (isComment || !isValid) return;
        
        // Get key/value pair and save it
        const [key, folder] = line.split("=");

        checkAndSaveFolder(index, folder);
    });
}

customEnv();
module.exports = customEnv;