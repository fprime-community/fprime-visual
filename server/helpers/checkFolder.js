const fs = require("fs");

let folderList = [];
let folderStatus = [];
function checkAndSaveFolder(index, folder, reset, folderLength, callback) {
    if (reset) {
        folderList = [];
        folderStatus = [];
    }

    folder = folder.trim()
    if (folder.slice(-1) !== '/') {
        folder = folder + "/"
    }
    
    fs.stat(folder, function(err, stats) {
        // Push folder
        folderList.push(folder);

        // Push status
        if (err || !stats.isDirectory()) {
            console.log(`Folder not found. See .env file -- Line:${index + 1} Path:${folder}` );
            // append 404 status of this folder to the folderStatus array.
            folderStatus.push('404')
        } else {
            folderStatus.push('200')
        }
        
        // Create folders object (with folders and status)
        const folderListStatus = {
            folders: folderList,
            status: folderStatus
        };

        // Update folders
        process.env.folders = JSON.stringify(folderListStatus);

        if (folderLength === folderList.length) {
            folderList = [];
            folderStatus = [];
            callback && callback(folderListStatus);
        }
    });
    /// ...
}

module.exports = checkAndSaveFolder;