import {renderers} from "./renderers/index.js";

// graph config & constants, used by all layouts
// defined here because we may want to let users change some of these as dynamic settings in future
const config = {
  canvasBackground: theme.canvasBackground,
  component: theme.component,
  offset: 40,
  portBox: {
    // Source rectangle icon
    sourceWidth: 2,
    sourceHeight: 4,
    // Target triangle icon
    targetWidth: 12,
    targetHeight: 10,
    targetFillStyle: "#0F0",
    size: 30,
    ...theme.portBox
  },
  portDistance: 210,
  columns: {
    defaultMarginMax: 150,
    defaultMargin: 25
  },
  strokeStyle: theme.strokeStyle,
  lineWidth: 2,
  bendRadius: 6
};

const Program = {
  init() {
    this.bindEvents();
    this.loadFolders();
    this.initLayoutOptions();
  },
  
  bindEvents() {
    // On window resize, reload the graph to re-render with new size
    // todo: could reuse existing graph instead of re-loading it from server
    window
      .addEventListener("resize", deBounce(this.loadFileAndRender.bind(Program), 300));
    
    // On folder (dropdown) change, load the filenames in that folder
    document
      .getElementById("select-folder")
      .addEventListener("change", this.loadFileNames.bind(this));
    
    // On file (dropdown) change, load the file and render the graph
    document
      .getElementById("select-file")
      .addEventListener("change", () => this.loadFileAndRender());

    document
      .getElementById("select-layout")
      .addEventListener("change", () => this.loadFileAndRender());
  
    document
      .getElementById("info-button")
      .addEventListener("click", (event) => this.toggleConfig());

    document
      .getElementById('screenshot-button')
      .addEventListener('click', (event) => this.screenshotCanvas(event));
  },
  initLayoutOptions() {
    const rendererKeys = Object.keys(renderers);
    const rendererLabels = rendererKeys.map(key => renderers[key].name || key);
    this.populateOptions(rendererKeys, '#select-layout', rendererLabels);
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
    return fetch('/get-file?file=' + jsonFile)
      // Parse server response into json 
      .then((response) => response.json());
  },

  loadFolders() {
    fetch('/get-folder-list')
      .then((response) => response.json())
      .then(this.handleFolderList.bind(this))
  },

  handleFolderList(response) {
    let element = '#alert';

    if (!response.err) {  
      element = '#canvas-container';
      this.populateOptions(response.folders, '#select-folder');
      if (response.folders.length === 1) {
        // Hide folder selection if only one folder is found
        document.getElementById("select-folder-zone").style.display = 'none';
      } else if (response.folders.length > 1) {
        // set examples folder as the default selected option if it exists
        const examplesFolder = response.folders.find(path => path.includes('examples'));
        const selectFolderEl = document.getElementById("select-folder");
        if(examplesFolder) selectFolderEl.value = examplesFolder;
      }
      this.loadFileNames();
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
        this.loadFileAndRender();
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

  populateOptions (data, selectID, labels) {
    // Create a new <option> in the dropdown for each item in the data
    const options = data.map((path, i) => {
      let label = path.replace(/\.json$/, '');
      if(labels && labels.length > i && labels[i]) {
        label = labels[i];
      }
      return `<option value = "${path}">${label}</option>`;
    });

    document.querySelector(selectID).innerHTML = options.join('');
  },
  
  loadFileAndRender () {
    // load the JSON file selected in the dropdown
    const fileName = document.getElementById('select-file').value;
    if (!fileName) {
      return;
    }
    // Generate file path.
    const path = this.getFolder() + fileName;

    // get the renderer which will render the data
    // TODO: better abstraction of `layouts` vs. `renderers` - ideally multiple layouts sharing one renderer?
    const rendererKey = document.getElementById('select-layout').value;
    if(!rendererKey) return;
    const render = renderers[rendererKey].render;

    // Load JSON graph file and use renderer to render it
    const loadingJSON = this.loadJSON(path);
    loadingJSON.then((fpGraph) => {
      render(fpGraph, config, 'fprime-graph');
    }); // todo: catch and throw error
  }
};

Program.init();
