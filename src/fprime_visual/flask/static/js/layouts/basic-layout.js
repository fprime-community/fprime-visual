/*
 * get basic graph layout
 * @param {GraphData} data - The graph
 * @returns {GraphLayout} layout - Layout of the graph with precise X,Y positions and sizes
 */
export function getBasicLayout(data, config, canvasSize) {
  const columnSize = getColumnSize(data, config, canvasSize.width);
  const columnsLayout = data.columns.map((column, columnIndex) => {
    // keep track of Y location of the next box
    let nextBoxY = config.offset;
    const columnLayout = column.map((component, instanceIndex) => {
      const boxLayout = {
        x: config.offset + columnIndex * columnSize.width + columnSize.margin * columnIndex,
        y: nextBoxY,
        height: componentHeight(component, config),
        width: columnSize.width
      }
      // next box will placed below the bottom of this box + margin
      nextBoxY = (boxLayout.y + boxLayout.height) + config.component.marginBottom;
      console.log('boxLayout', component, boxLayout, columnSize);
      return boxLayout;
    });

    return columnLayout;
  });

  return {
    columns: columnsLayout,
    columnSize: getColumnSize(data, config, canvasSize.width)
  };
}

// --- HELPERS --- //
export function componentHeight({ outputPorts, inputPorts }, config) {
  // TODO avoid passing in config here?
  // Return the required height of a single component (box) in the layout
  const getAmountOfPorts = (portsGroups) => portsGroups.reduce((sum, { portNumbers }) => {
    return sum + portNumbers.length
  }, 0);

  // component has 1 line at the top for title, + each port (input or output) is on its own line
  return (1 +
    getAmountOfPorts(outputPorts) +
    getAmountOfPorts(inputPorts)
  ) * config.component.lineHeight;
}

/**
 * Return the required height of the entire layout canvas
 * @param {GraphData} data - graph data object from the API
 * @param config - the graph config object
 */
export const calculateHeight = (data, config) => {
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

export function getColumnSize(data, config, canvasWidth) {
  // Calculate column widths, margins, and padding

  const { defaultMargin, defaultMarginMax } = config.columns;
  const { defaultWidth, defaultPadding } = config.component;
  const columnCount = data.columns.length;
  // columns are offset from the edges, so only (width - offsets) is available to use
  const availableWidth = canvasWidth - config.offset * 2;
  // defaultMarginMax is the maximum allowable margin between columns
  // calculate column width assuming this max as the margin, to see if we need to shrink
  let maxColumnWidth = (availableWidth - defaultMarginMax * (columnCount - 1)) / columnCount;
  // if using the max margin causes column widths to be < defaultWidth (preferred column width),
  // we need to shrink the margins to allow wider columns
  const shrink = maxColumnWidth <= defaultWidth;

  if(shrink) {
    return {
      width: availableWidth * (1 - defaultMargin / 100) / columnCount,
      margin: (availableWidth * defaultMargin / 100) / (columnCount - 1),
      // use half-sized x-margins if columns are shrunk
      padding: {
        ...defaultPadding,
        x: (defaultPadding.x || 0) * .5
      }
    };
  } else { // full-sized columns with max-width margins
    return {
      width: config.component.defaultWidth,
      margin: defaultMarginMax,
      padding: { ...defaultPadding }
    }
  }
}