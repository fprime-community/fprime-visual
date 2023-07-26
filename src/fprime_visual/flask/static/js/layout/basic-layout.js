/*
 * get basic graph layout
 * @param {GraphData} data - The graph
 * @returns {GraphLayout} layout - Layout of the graph with precise X,Y positions and sizes
 */
export function getBasicLayout(data, config) {

  const columnsLayout = data.columns.map((column, columnIndex) => {
    // keep track of Y location of the next box
    let nextBoxY = config.offset;
    const columnLayout = column.map((component, instanceIndex) => {
      const boxLayout = {
        x: config.offset + columnIndex * config.component.width + config.columns.margin * columnIndex,
        y: nextBoxY,
        height: componentHeight(component, config),
        width: config.component.width
      }
      // next box will placed below the bottom of this box + margin
      nextBoxY = (boxLayout.y + boxLayout.height) + config.component.marginBottom;
      console.log(component, boxLayout, config.component.width);
      return boxLayout;
    });

    //

    return columnLayout;
  });


  return {
    columns: columnsLayout
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