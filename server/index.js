if (process.argv[2] === '-h') {
    console.log('For assistance please check the README.md');
    process.exit();
}
const path = require('path')
const clc = require("cli-color");


// Folders config
require('./helpers/customEnv.js')

// Import express 
// Create a new application/server
const express = require('express')
const app = express().disable("x-powered-by")
const port = 3000
const terminalLink = require('terminal-link');


// Controllers
const getFileList = require('./controllers/get-file-list.js')
const getFile = require('./controllers/get-file.js')
const getFolderList = require('./controllers/get-folder-list.js')
const createEnv = require('./controllers/create-env.js')

// Handle all the static files
//app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public').replace('server/', '')));



// Route/endpoints
app.get('/get-folder-list', getFolderList);
app.get('/get-file-list', getFileList);
app.get('/get-file', getFile);
app.get('/create-env', createEnv);

// Open the server; listen to port 3000
app.listen(port, () => {
    const path = `http://localhost:${port}`
    const link = terminalLink(path, path)
    console.log(`F Prime Viz listening at`, clc.cyanBright(link))
});
