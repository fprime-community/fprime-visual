import {calculateHeight, getBasicLayout} from "../layouts/basic-layout.js";
import {Box} from "../classes/box.js";
// JSDoc typedefs defining data types, see typedefs file for details
import "../typedefs.js";

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
    new Box(box, boxPosition, layout.columnSize, connections, [columnIndex, instanceIndex], context, config);
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


function drawLines(connections, layout, context) {
  const {columnSize} = layout;
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
      start.x + columnSize.margin / 2,
      start.y,
      end.x - columnSize.margin / 2,
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

export function setupCanvas(size, canvasId) {
  // handle high-DPI displays
  const dpi = window.devicePixelRatio;
  const canvas = document.querySelector(`canvas#${canvasId}`);
  canvas.width = size.width * dpi;
  canvas.height = size.height * dpi;
  canvas.style.width = size.width + 'px';
  canvas.style.height = size.height + 'px';
  canvas.style.background = config.canvasBackground;
  document.body.style.background = config.canvasBackground;

  // Gets context
  const context = canvas.getContext("2d");
  // Sets global configuration
  context.textBaseline = "middle";
  // Sets DPI
  context.setTransform(dpi, 0, 0, dpi, 0, 0);

  return context
}

/**
 * Render the graph visualization
 * @param {GraphData} data - Parsed data object from the API
 */
export function render(data) {
  console.log(data)

  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns, config),
  };
  const context = setupCanvas(size, 'fprime-graph');

  const layout = getBasicLayout(data, config, size);
  console.log('layout', layout);

  // Draw every box/instance
  drawBoxes(data, layout, context);

  // Draw connections/lines
  drawLines(data.connections, layout, context);
}
