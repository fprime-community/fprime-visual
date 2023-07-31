import {getBasicLayout, componentHeight} from "./layout/basic-layout.js";
import {Box} from "./classes/box.js";
// JSDoc typedefs are used to define our data types, see typedefs file for details
import "./typedefs.js";

const config = {
  canvasBackground: theme.canvasBackground,
  component: theme.component,
  offset: 40,
  portBox: {
    // Source rectangle icon
    sourceWidth: 2,
    sourceHeight: 4,
    // Target triangle icon
    targetWidth: 7,
    targetHeight: 9,
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
  lineWidth: 1,
};

let connections = []

const drawColumn = (column, columnIndex, connections, layout, context) => {
  console.log('layout', layout);
    // Draw each box
    column.forEach((box, instanceIndex) => {
      // get this box's position from the layout object
      const boxPosition = layout.columns[columnIndex][instanceIndex];
      // box renders when constructed
      new Box(box, boxPosition, connections, [columnIndex, instanceIndex], context, config);
    });
  }

const drawBoxes = function (data, layout, context) {
  // Reset previous connections (lines)
  connections = []
  
  // Draw each column
  data.columns.forEach(
    (column, index) => drawColumn(column, index, data.connections, layout, context)
  );
};


function drawLines(connections, context) {
  // Draw all connection lines (links) between ports in the layout
  context.save();
  context.globalCompositeOperation = 'destination-over';

  connections.forEach((connection) => {
    console.log('connection', connection);
    const start = connection[0];
    const end = connection[1];

    if (!start || !end) return // console.warn(start,end);

    start.x += config.portBox.size / 2;
    end.x -= config.portBox.size / 2;
    // Draw the line give the position

    context.beginPath();
    context.moveTo(start.x, start.y);
    context.bezierCurveTo(
      start.x + config.columns.margin / 2,
      start.y,
      end.x - config.columns.margin / 2,
      end.y,
      end.x,
      end.y
    );
    context.strokeStyle = config.strokeStyle;
    context.lineWidth = config.lineWidth;
    context.stroke();
  });
  context.restore();
}

/**
 * Return the required height of the entire layout canvas
 * @param {GraphData} data - graph data object from the API
 */
const calculateHeight = (data) => {
  // total height is dictated by the height of the tallest column.
  let greatestHeight = 0;

  // Calculate each column height and use the largest one
  data.forEach((column) => {
    // Column height is the sum of the heights of all components in column + margin
    const height = column.reduce((height, component) => {
      return height + componentHeight(component, config) + config.component.marginBottom;
    }, 0);
    // If this column height is bigger, then update the total height
    if (height > greatestHeight) greatestHeight = height;
  });

  // Return height
  return config.offset * 2 + greatestHeight;
};

/**
 * Render the graph visualization
 * @param {GraphData} data - Parsed data object from the API
 */
export function render(data) {

  console.log(data)

  const dpi = window.devicePixelRatio;
  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns),
  };

  // Inits canvas
  const canvas = document.querySelector("canvas#fprime-graph");
  canvas.width = size.width * dpi;
  canvas.height = size.height * dpi;
  canvas.style.width = size.width;
  canvas.style.height = size.height;
  canvas.style.background = config.canvasBackground;
  document.body.style.background = config.canvasBackground;
  
  // Gets context
  const context = canvas.getContext("2d");
  // window.context = context;

  // Sets global configuration
  context.textBaseline = "middle";

  // Sets DPI
  context.setTransform(dpi, 0, 0, dpi, 0, 0);

  // Calculate column width
  const columnCount = data.columns.length;
  const availableSpace = size.width - config.offset * 2;
  //console.log(availableSpace, columnCount, config.,)
  //let _maxColumnWidth = availableSpace / columnCount - (config.columns.defaultMarginMax * (columnCount - 1)) / columnCount;
  let maxColumnWidth = (availableSpace - config.columns.defaultMarginMax * (columnCount - 1)) / columnCount;

  // Need to shrink?
  const shrink = maxColumnWidth <= config.component.defaultWidth;
  const { defaultMargin, defaultMarginMax } = config.columns;
  
  config.component.padding = { ...config.component.defaultPadding };
  
  // Update column width and margin
  // TODO: Don't store this in config... config should be largely static, not for storing state of this particular layout
  if (shrink) {
    config.component.width = availableSpace * (1 - defaultMargin / 100) / columnCount;
    config.columns.margin = (availableSpace * defaultMargin / 100) / (columnCount - 1);
    config.component.padding.x = config.component.padding.x * .5 
  } else {
    config.component.width = config.component.defaultWidth;
    config.columns.margin = defaultMarginMax;
  }

  const layout = getBasicLayout(data, config);
  console.log('layout', layout);
  
  // Draw every box/instance
  drawBoxes(data, layout, context);

  // Draw connections/lines
  drawLines(data.connections, context);
}
