function addConnection(data, connection) {
  // Search for existing components (source and target) within the columns
  let [sourceComponent, sourceColumn] = findComponent(
    data,
    connection.source.component
  );
  let [targetComponent, targetColumn] = findComponent(
    data,
    connection.target.component
  );

  log("|".repeat(50));
  log("Connection");
  log("name", connection.name);
  log("source", connection.source);
  log("target", connection.target);

  function getPort() {
    return targetComponent.targets.find(
      (port) =>
        port.num === connection.target.num &&
        port.port === connection.target.port
    );
  }
  
  // If connection source and target are ports of the same component...
  if (connection.source.component === connection.target.component) {
    // If component has not been created, create it
    const portExist = (data, port) => {
      return data.find(
        ({ num, port: portName }) => port.num === num && portName === port.port
      );
    };

    console.log(targetComponent, targetColumn, connection);

    if (!sourceComponent) {
      sourceComponent = createComponent(
        data,
        0,
        undefined,
        connection.source,
        connection.target
      );
    }

    if (!portExist(sourceComponent.sources, connection.source)) {
      sourceComponent.sources.push({
        ...connection.source,
        connection: connection.target,
      });
    }

    if (!portExist(sourceComponent.targets, connection.target)) {
      sourceComponent.targets.push({
        ...connection.target,
        connection: connection.source,
      });
    }

    //Add ports into the component.
    // RR: I need to dig more into rest/spread ellipses.
    // Check if this line is needed!
    // source.targets.push(connection.target);

    log("- Target added -");
    log(sourceComponent.targets[sourceComponent.targets.length - 1]);
    log("- Source added -");
    log(sourceComponent.sources[sourceComponent.sources.length - 1]);

    //console.warn('source!', sourceComponent)
    // Source already exists; add port to component sources
  } else if (sourceComponent) {
    // Add port to component
    sourceComponent.sources.push(connection.source);

    // If target exists, push
    if (targetComponent) {
      // Adds port to target component
      if (!getPort()) {
        targetComponent.targets.push({
          ...connection.target,
          connection: connection.source,
        });
      }

      // Adds connection
      connection.source.connection = connection.target;
    } else {
      createComponent(
        data,
        sourceColumn + 1,
        "target",
        connection.target,
        connection.source
      );
      connection.source.connection = connection.target;
    }
  } else {
    // Source doesn't exist -> it was not created by any previous
    // component -> it goes at the first column
    const columnIndex = 0;

    connection.source.port === "bufferSendOut" &&
      console.log(connection, sourceComponent, targetComponent);

    // Create component
    const component = createComponent(
      data,
      columnIndex,
      "source",
      connection.source,
      connection.target
    );

    // If component target already exist
    if (targetComponent) {
      const port = getPort();

      connection.source.port === "bufferSendOut" && console.log({ port });

      if (!port) {
        // Creates target component adding the connection to source
        const port = {
          ...connection.target,
          connection: connection.source,
        };

        targetComponent.targets.push(port);
      } else {
        /*connection.source.connection = port;
                component.sources[0].connection = connection.target;
                console.log(component.sources[0], connection.target)*/
      }
    } else {
      // If target doesn't exist, create it on the next column
      createComponent(data, columnIndex + 1, "target", connection.target);
    }
  }

  // Create some space in the log for legibility.
  log("");
  log("");
}

function findComponent(data, name) {
  // Default return value
  let match = [];

  // Index used to know in which column the component was found
  let index = 0;

  // Search inside each column
  for (let column of data) {
    // Search for component inside each column element
    const component = column.find((component) => {
      return component.name === name;
    });

    // If component was found, update match and finish the loop
    if (component) {
      match = [component, index];
      break;
    }

    // Increase column index
    index++;
  }

  // Return component and column index (or empty array [] if not found)
  return match;
}

function createComponent(data, columnIndex, type, element, target) {
  // Get column from column list given some index position
  let column = data[columnIndex];

  // If no column was created at this index position,
  // create a new one and add it to the column list
  if (!column) {
    column = [];
    data.push(column);
  }

  // Create component object
  const component = {
    name: element.component,
    sources: [],
    targets: [],
  };

  // Create component port element
  const port = {
    num: element.num,
    port: element.port,
    type: element.type,
    connection: target,
  };

  // Add port to component sources/targets
  if (type === "source") {
    component.sources.push(port);
  }

  if (type === "target") {
    component.targets.push(port);
  }

  // Add component to column
  column.push(component);

  log("--------------------");
  log("- Component created -");
  log(component);
  log("--------------------");

  return component;
}