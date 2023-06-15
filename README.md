# F Prime Visualizer (FPV)
F Prime Visualizer (FPV) is a browser-based topology visualizer for the [F´ (F Prime)](https:/nasa.github.io/fprime) flight software and embedded systems framework.

FPV is a web application written in [Flask](https://flask.palletsprojects.com/).

## Installation 

> Note: Still under development. For now, installation is available from source only
```bash
pip install .
```

## Running

#### Data source
FPV reads .json files created by [F Prime Layout](https://github.com/fprime-community/fprime-layout).

Reference .json files live in the ```examples``` directory so you can test drive the application right away.
```bash
export FPRIME_VISUAL_ROOT=./examples
fprime-visual
```

#### Stopping
<kbd>Ctrl</kbd> + <kbd>C</kbd> will SIGINT Express to stop it.


#### Selecting a Theme
You can change the look of FPV by selecting one of the themes residing in the public/js/themes directory. Update the path in index.html to change.

#### Capturing a full size screenshot
There is currently no in-application feature for this. The Chrome and Firefox browsers provide this functionality built-in. Check out the
[Google Chrome How-to](https://developers.google.com/web/updates/2017/04/devtools-release-notes#screenshots) and
 [Firefox How-to](https://support.mozilla.org/en-US/kb/firefox-screenshots) for guidance.

### Customizing FPV

#### Creating Your Own Theme
Theme colors use RGBA (RGB color values with an Alpha channel). The alpha channel is particularly important for the component box backgrounds. Connection lines occasionally route _behind_ component boxes, so an opaque percentage value of 80% (.8) on those boxes is strongly encouraged.

Example: backgroundColor: "rgba(61, 61, 61, .80)"

#### Making Changes to the Canvas
You can make more intensive changes, such as connection line width and column width, by editing the config variable at the top of the public/js/canvas.js file.
