import {calculateHeight, getBasicLayout} from "../layouts/basic-layout.js";
import {Box} from "./helpers/box.js";
import {setupCanvas} from "./helpers/render-utils.js";
// JSDoc typedefs defining data types, see typedefs file for details
import "../typedefs.js";

let config;
let connections = []

const drawColumn = (column, columnIndex, connections, layout, context) => {
  console.log('layout', layout);
  // Draw each box
  column.forEach((box, instanceIndex) => {
    // get this box's position from the layout object
    const boxPosition = layout.columns[columnIndex][instanceIndex];
    // box renders itself when constructed
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

    if (!start || !end) return

    // true x start/end of the line is offset by the width of the port extending over the edge of the box
    const trueXStart = start.x + config.portBox.size / 2;
    const trueXEnd = end.x -=  config.portBox.targetWidth + ( config.portBox.size / 2 );

    context.beginPath();
    context.moveTo(trueXStart, start.y);
    context.bezierCurveTo(
      start.x + columnSize.margin / 2,
      start.y,
      end.x - columnSize.margin / 2,
      end.y,
      trueXEnd,
      end.y
    );
    context.strokeStyle = config.strokeStyle;
    context.lineWidth = config.lineWidth;
    context.stroke();
  });
  context.restore();
}


/**
 * Render the graph visualization
 * @param {GraphData} data - Parsed data object from the API
 * @param {object} config - config object with layout options
 * @param {string} canvasId - ID of the existing <canvas> element to render within
 */
export function render(data, passedConfig, canvasId = 'fprime-graph') {
  // stash config in a "global" so we don't have to thread the config argument through a bunch of old code
  config = passedConfig;

  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns, config),
  };
  const context = setupCanvas(size, 'fprime-graph', config);

  const layout = getBasicLayout(data, config, size);

  // Draw every box/instance
  drawBoxes(data, layout, context);

  // Draw connections/lines
  drawLines(data.connections, layout, context);
}
