const fs = require('fs')

module.exports = (req, res) => {
    const { folder } = req.query; 

    fs.readdir(folder, (error, files) => {
        if (error) {
            // handle this error...
            console.log('Something failed', error);
            return;
        }

        // remove .DS_Store file
        files = files.filter((file) => {
            if (file !== '.DS_Store') return true;
            // return file !== '.DS_Store';
        })
        
        // get only json files
        const jsonFiles = files.filter((file) => {
            return file.match(/\.json$/); 
        })

        res.json({jsonFiles});
    })
}
