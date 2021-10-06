const getFolderList = (req, res) => {
  let folderList = {};

  if (process.env.folders) {
    folderList = JSON.parse(process.env.folders);
  } else {
    folderList.err = true;
  }

  res.json(folderList);
};

module.exports = getFolderList;
