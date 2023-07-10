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
  
    document
      .getElementById("info-button")
      .addEventListener("click", (event) => this.toggleConfig());

    document
      .getElementById('screenshot-button')
      .addEventListener('click', (event) => this.screenshotCanvas(event));
  },

  screenshotCanvas(event) {
    // Hacky way to screenshot a Canvas
    // See https://fjolt.com/article/html-canvas-save-as-image
    let imageFormat = "png";

    let canvas = document.querySelector('canvas');
    // Convert our canvas to a data URL
    let canvasUrl = canvas.toDataURL("image/" + imageFormat);
    // Create an anchor, and set the href value to our data URL
    const createEl = document.createElement('a');
    createEl.href = canvasUrl;
    // This is the name of our downloaded file
    createEl.download = document.getElementById('select-file').value.split('.json')[0] + "." + imageFormat;
    // Click the download button, causing a download, and then remove it
    createEl.click();
    createEl.remove();
  },
  
  // Returns a response promise asynchronously
  loadJSON(jsonFile) {
    fetch('/get-file?file=' + jsonFile)
      // Parse server response into json 
      .then((response) => response.json())
      .then(render);
  },

  loadFolders() {
    fetch('/get-folder-list')
      .then((response) => response.json())
      .then(this.handleFolderList.bind(this))
  },

  handleFolderList(response) {
    let element = '#alert';

    if (!response.err) {  
      element = 'canvas';
      this.populateOptions(response.folders, '#select-folder');
      this.loadFileNames();
      // Hide folder selection if only one folder is found
      if (response.folders.length == 1) {
        document.getElementById("select-folder-zone").style.display = 'none';
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

  loadFileNames() {
    fetch('/get-file-list?folder=' + this.getFolder())
      .then((response) => response.json())
      .then((data) => {
        this.populateOptions(data.jsonFiles, '#select-file');
        this.loadFile();
      })
  },

  getFolder() {
    let folder = document.getElementById("select-folder").value;
    // Append trailing slash to ease path concatenation
    if (!folder.endsWith('/')) {
      folder += '/';
    }
    return folder;
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

  }
};

Program.init();
