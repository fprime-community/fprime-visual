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

const drawColumn = (column, columnIndex, connections, context) => {
    let lastBox;

    // Draw each box
    column.forEach((box, instanceIndex) => {
      // Origin
      const position = {
        x: config.offset + columnIndex * config.component.width + config.columns.margin * columnIndex,
        y: instanceIndex === 0 ? config.offset : lastBox.bottom + config.component.marginBottom,
      };

      lastBox = new Box(box, position, connections, [columnIndex, instanceIndex], context);
    });
  }

const drawBoxes = function (data, context) {
  // Reset previous connections (lines)
  connections = []
  
  // Draw each ecolumn
  data.columns.forEach(
    (column, index) => drawColumn(column, index, data.connections, context)
  );
};

function drawLines(connections, context) {
  context.save();
  context.globalCompositeOperation = 'destination-over';

  connections.forEach((connection) => {
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

const calculateHeight = (data) => {
  let greatestHeight = 0;

  // Calculate each column height and use the largest one
  data.forEach((column) => {
    // Get height
    const height = column.reduce((height, component) => {
      return height + componentHeight(component) + config.component.marginBottom;
    }, 0);
    // If this column height is bigger, then updates the total height
    if (height > greatestHeight) greatestHeight = height;
  });

  // Return height
  return config.offset * 2 + greatestHeight;
};

const componentHeight = ({ outputPorts, inputPorts }) => {
  const getAmountOfPorts = (portsGroups) => portsGroups.reduce((sum, { portNumbers }) => {
    return sum + portNumbers.length
  }, 0);

  return (1 +
    getAmountOfPorts(outputPorts) +
    getAmountOfPorts(inputPorts)
  ) * config.component.lineHeight;
}

function render(data) {
  console.log(data)

  const dpi = window.devicePixelRatio;
  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns),
  };

  // Inits canvas
  const canvas = document.querySelector("canvas");
  canvas.width = size.width * dpi;
  canvas.height = size.height * dpi;
  canvas.style.width = size.width;
  canvas.style.height = size.height;
  canvas.style.background = config.canvasBackground;
  document.body.style.background = config.canvasBackground;
  
  // Gets context
  context = canvas.getContext("2d");
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
  if (shrink) {
    config.component.width = availableSpace * (1 - defaultMargin / 100) / columnCount;
    config.columns.margin = (availableSpace * defaultMargin / 100) / (columnCount - 1);
    config.component.padding.x = config.component.padding.x * .5 
  } else {
    config.component.width = config.component.defaultWidth;
    config.columns.margin = defaultMarginMax;
  }
  
  // Draw every box/instance
  drawBoxes(data, context);

  // Draw connections/lines
  drawLines(data.connections, context);
}
