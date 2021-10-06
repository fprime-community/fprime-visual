const fs = require("fs");
const checkAndSaveFolder = require('../helpers/checkFolder.js')

const createEnv = (req, res) => {
  // Create .env file and write the folders from the form into it.
  const data = req.query.folders
    .split(",")
    .map((folder) => {
      folder = folder.trim();

      if (!folder.match(/\/$/)) {
        folder = folder.concat("/");
      }
      return `DATA_FOLDER=${folder}`;
    })
    .join("\n");

  fs.writeFile(process.env.path, data, (err) => {
    if (err) throw err;
    
    /* Send response. This should be object containing 2 arrays. 
    folderList as an array and status of 200 as an array  */
    const queryFolders = req.query.folders.split(",");
    const folders = {
      folders: queryFolders,
      status: queryFolders.map(() => "200"),
    };

    // For each line add a variable
    const lines = req.query.folders.split(",")

    lines.forEach((folder, index) => {
      checkAndSaveFolder(index, folder, !index, lines.length, function(folders) {
        res.json(folders);
      });
    });
  });
};

module.exports = createEnv;
