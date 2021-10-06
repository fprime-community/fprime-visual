let logsOn = false;
const log = (() => {
  if (logsOn) {
    return console.log.bind(console);
  } else {
    return () => {};
  }
})();


const Program = {
  init() {
    this.events();
    this.loadFolders();
  },
  
  events() {
    // On browser resize
    window
      .addEventListener("resize", deBounce(this.loadFile.bind(Program), 300));
    
    // On folder change
    document
      .getElementById("select-folder")
      .addEventListener("change", this.loadFileNames.bind(this));
    
    // On file change
    document
      .getElementById("select-file")
      .addEventListener("change", () => this.loadFile());
    
    // On form submit
    document
      .getElementById("submit-folders")
      .addEventListener("click", (event) => this.handleCreateEnv());
  
    document
      .querySelector(".configuration")
      .addEventListener("click", (event) => this.toggleConfig());
  },
  
  // Returns a response promise asynchronously
  loadJSON(jsonFile) {
    fetch('/get-file?file=' + jsonFile)
      // Parse server response into json 
      .then((response) => response.json())
      .then(render);
  },

  handleCreateEnv() {
    const foldersInput = document.getElementById("folder-paths");
    const paths = foldersInput.value
      .trim()
      .replace(/\n/g, ',')
      .replace(/\s/g, '')
    // Append trailing slash $0.value.match(/[a-z0-9_\-\/]+[\\\/]/i)

    fetch('/create-env?folders=' + paths)
      .then((response) => response.json())
      .then((response) => {
        console.log(response); 
        document.querySelector('#alert').classList.remove('show');
        this.handleFolderList(response)
      })
  },

  loadFolders() {
    fetch('/get-folder-list')
      .then((response) => response.json())
      .then(this.handleFolderList.bind(this))
  },

  handleFolderList(response) {
    let element = '#alert';

    if (!response.err) {
      // Comment this block
      const folders = response.folders.map((folder, index) => {
        if (response.status[index] === '404') {
          folder += ' <-- invalid line';
        }
        return folder;
      });
      
  
      document.querySelector('textarea').value = folders.join('\n');
      
  
      if (!~response.status.indexOf('404')) {
        element = 'canvas';
        this.populateOptions(response.folders, '#select-folder');
        this.loadFileNames();
      }
    }

    // Show alert message or canvas.
    document.querySelector(element).classList.add('show');
  },
  
  toggleConfig() {
    if (document.querySelector('canvas').classList.contains('show')) {
      document.querySelector('canvas').classList.remove('show');
      document.querySelector('#alert').classList.add('show');
    } else {
      document.querySelector('#alert').classList.remove('show');
      document.querySelector('canvas').classList.add('show');
    }
  },

  /*toggleConfig() {
    document.querySelector('#alert').classList.toggle('show');
    document.querySelector('canvas').classList.toggle('show');
  },*/

  loadFileNames() {
    fetch('/get-file-list?folder=' + this.getFolder())
      .then((response) => response.json())
      .then((data) => {
        this.populateOptions(data.jsonFiles, '#select-file');
        this.loadFile();
      })
  },

  getFolder() {
    return document.getElementById("select-folder").value
  },

  populateOptions (data, selectID) {
    console.log('populateOptions: ', data)
    // Map each option
    const options = data.map((path) => {
      const title = path.replace(/\.json$/, '')
      return `<option value = "${path}">${title}</option>`;
    });

    document.querySelector(selectID).innerHTML = options.join('');
  },
  
  loadFile () {
    const fileName = document.getElementById('select-file').value;
    if (!fileName) {
      return
    }

    // Generates file path.
    const path = this.getFolder() + fileName;
    
    // Loads file
    this.loadJSON(path);
  },

  alertUser() {
    // document.querySelector('#alert').innerHTML="No .env file found"

  }
};

Program.init();
