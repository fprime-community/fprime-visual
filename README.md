# F Prime Visualizer (FPV)
F Prime Visualizer (FPV) is a browser-based topology visualizer for the [F´ (F Prime)](https:/nasa.github.io/fprime) flight software and embedded systems framework.

FPV is a web application written in [Flask](https://flask.palletsprojects.com/).

## Installation 

```bash
pip install fprime-visual
```

## Running

#### Data source
FPV reads .json files created by [F Prime Layout](https://github.com/fprime-community/fprime-layout).

Reference .json files live in the ```examples``` directory so you can test drive the application right away.
```bash
fprime-visual --source-dir examples/
```

#### Stopping
<kbd>Ctrl</kbd> + <kbd>C</kbd> will stop the application.


#### Selecting a Theme
You can change the look of FPV by selecting one of the themes residing in the flask/static/js/themes directory.
Themes can be selected with the following argument
```bash
fprime-visual --theme dark
```

#### Capturing a full size screenshot
A screenshot button in the top banner allows for capturing a screenshot of the current view as a PNG image.

### Customizing FPV

#### Creating Your Own Theme
Theme colors use RGBA (RGB color values with an Alpha channel). The alpha channel is particularly important for the component box backgrounds. Connection lines occasionally route _behind_ component boxes, so an opaque percentage value of 80% (.8) on those boxes is strongly encouraged.

Example: backgroundColor: "rgba(61, 61, 61, .80)"

#### Making Changes to the Canvas
You can make more intensive changes, such as connection line width and column width, by editing the config variable at the top of the public/js/canvas.js file.
