const fs = require("fs");

const getFile = (req, res) => {
    // this is now an array instead of a list
    let filePath = req.query.file; 

    //console.log(filePath);
    
    try {
        const file = fs.readFileSync(filePath, "utf8");
        res.send(file)
    } catch (err) {
        throw err;
    }
}

module.exports = getFile;