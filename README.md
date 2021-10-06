# F Prime Visualizer (FPV)
F Prime Visualizer (FPV) is a browser-based topology visualizer for the [F´ (F Prime)](https://github.com/nasa/fpr) flight software and embedded systems framework.

FPV is a web application written in Javascript, HTML Canvas and CSS. 

FPV uses Node.js and the following Node packages for following application tasks: 
- accessing the local filesystem ([fs](https://nodejs.org/api/fs.html))
- loading environment variables ([dotenv](https://www.npmjs.com/package/dotenv))
- serving web pages on localhost ([Express](https://expressjs.com/))

You can check the server directory in this repository to tour the web server configuration and controller files.

## Data Requirements
FPV reads .json files created by [F Prime Layout's](https://github.jpl.nasa.gov/bocchino/fprime-layout#fpl-convert-xml) [fpl-layout](https://github.jpl.nasa.gov/bocchino/fprime-layout#fpl-layout) tool.

Reference .json files live in the ```Ref``` directory so you can test drive the application right away.

## Preinstallation Requirements
Node Package Manager ([npm](https://www.npmjs.com/get-npm)) is required to install and comes included with [node.js](https://nodejs.org/). This application was created using Node 12.18.4 LTS release.

## Installation
1. Clone the repo and open a terminal in the root of the project.

2. ```$ npm install```
This install command will create node_modules directory inside the application and install all of the packages that are specified in the package.json file. 

3. ```$ npm install -g nodemon```
Nodemon is a command-line interface (CLI) utility that will monitor for any changes in your source and automatically restart Express. For example, if you want to change your theme you can just edit the index.html file. Nodemon will detect the change and restart Express so you can immediately see the change. The -g parameter installs nodemon as a global package. Nodemon needs to be a global package so it can be run from the terminal. If you would like to see where these global packages are stored you can run ```$ npm list -g --depth=0``` to see a report of the install directory path and all of the global packages.

NOTE: Some installations of npm (ex: MacPorts) require the use of `sudo` to install global packages.

```$ sudo npm install -g nodemon```


## Running
### Running Inside the Application Root
```$ nodemon``` can be run from inside the application root. Nodemon will start up the application and report back the URL (ex: http://localhost:3000).

```
$ nodemon
[nodemon] 2.0.4
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,json
[nodemon] starting `node server/index.js`
reading file
F Prime Viz listening at http://localhost:3000
```
Nodemon can also handle manual restarts of Express for you. Type ```rs``` in this terminal window to restart.

Some terminals support <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> + <kbd>LMB</kbd> links in the terminal
(LMB = Left Mouse button).

Use any web browser to go to http://localhost:3000. 

### Running Outside the Application Root
Nodemon can be run from a directory outside of application root.
The .fpv-env can also be located outside of application root.

```$ nodemon /path/to/fprime-visual/server/index.js /another/path/to/.fpv-env```

Nodemon will start up the application and report back the URL (ex: http://localhost:3000) 

NOTE: Some operating systems, such as macOS, will ask you to allow incoming network connections for node.js.

Use any web browser to go to http://localhost:3000. 

## Stopping
<kbd>Ctrl</kbd> + <kbd>C</kbd> will SIGINT Express to stop it.

<kbd>Cmd</kbd> + <kbd>C</kbd> for MacOS users.


## Usage 
### Configuring FPV

#### Configuring Paths to Your Data Using .fpv-env
Paths to [fpl-layout](https://github.jpl.nasa.gov/bocchino/fprime-layout#fpl-layout)'s json files should be listed in a .fpv-env file in the application's root directory. If this file does not exist, the application provides you with a web form to so you can create one. You can re-edit this file anytime with settings icon in the upper right of the toolbar. You can also easily edit this file by hand. See the .sample-env for a configuration example.

#### Changing the Default Port
If you already have a service running on port 3000 you can set the port number in index.js.
```const port = 3000```

#### Selecting a Theme
You can change the look of FPV by selecting one of the themes residing in the public/js/themes directory. Update the path in index.html to change. 

#### Capturing a full size screenshot ####
There is currently no in-application feature for this. The Chrome and Firefox browsers provide this functionality built-in. Check out the 
[Google Chrome How-to](https://developers.google.com/web/updates/2017/04/devtools-release-notes#screenshots) and
 [Firefox How-to](https://support.mozilla.org/en-US/kb/firefox-screenshots) for guidance.

### Customizing FPV

#### Creating Your Own Theme
Theme colors use RGBA (RGB color values with an Alpha channel). The alpha channel is particularly important for the component box backgrounds. Connection lines occasionally route _behind_ component boxes, so an opaque percentage value of 80% (.8) on those boxes is strongly encouraged.

Example: backgroundColor: "rgba(61, 61, 61, .80)"

#### Making Changes to the Canvas
You can make more intensive changes, such as connection line width and column width, by editing the config variable at the top of the public/js/canvas.js file.
