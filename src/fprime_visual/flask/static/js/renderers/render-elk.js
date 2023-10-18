// some utils are borrowed from the basic layout
import {calculateHeight, componentHeight, getColumnSize} from "../layouts/basic-layout.js";
// import {drawGraph} from "./draw-graph.js";
import {setupCanvas} from "./render-utils.js";
// JSDoc typedefs defining data types, see typedefs file for details
import "../typedefs.js";

// DRAFT VERSION of alternate graph rendering using elkjs layout engine

// All the code for drawing/rendering an ELK graph on a canvas.
// These functions do NOT do any layout (positioning), they are given an already-laid-out
// ELK graph data structure and draw it on the given canvas context


// todo pass in config
const config = {
  canvasBackground: theme.canvasBackground,
  component: theme.component,
  offset: 40,
  portBox: {
    // Source rectangle icon
    sourceWidth: 2,
    sourceHeight: 4,
    // Target triangle icon
    targetWidth: 12,
    targetHeight: 10,
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
  lineWidth: 2,
  bendRadius: 6
};



/**
 * Translate the FPrime graph data into an ELK-format JSON graph
 * - https://eclipse.dev/elk/documentation/tooldevelopers/graphdatastructure/jsonformat.html
 * @param {GraphData} fpGraph - FPrime graph data object from the API
 * @returns {ElkNode}
 */
export function toElkGraph(fpGraph, size) {
  // determine width & spacing between columns (layers) based on available width
  const columnSize = getColumnSize(fpGraph, config, size.width);
  console.log('columnSize', columnSize);
  // create flat list of nodes with IDs
  const nodes = fpGraph.columns.map((column, colIndex) => {
    console.log(column);
    return column.map((fpNode, nodeIndex) => {
      const nodeHeight = componentHeight(fpNode, config);
      // Create all input and output ports for this node.
      // Use index "coordinates" as the port IDs so they are easy to reference in edges,
      // since GraphData.connections refers to them this way
      const {lineHeight} = config.component;
      // height of the node header (containing the name of the node)
      const headerHeight = Math.floor(lineHeight + (lineHeight * 0.25));
      // we need to specify each port's relative position & use the "FIXED_POS" graph setting to
      // properly satisfy port location requirements (not ideal, there may be a better way).
      // Cumulatively keep track of previous port's Y offset to calculate the next one
      let prevPortYOffset = 0;

      // create output and input ports for the ELK node
      const outputPorts = fpNode.outputPorts.map((portGroup, portGroupIndex) => {
        return portGroup.portNumbers.map((portNumber, portIndex) => {
          const position = {
            x: columnSize.width,
            y: headerHeight + prevPortYOffset,
          }
          prevPortYOffset += lineHeight;
          return {
            id: `${colIndex}_${nodeIndex}_${portGroupIndex}_${portNumber}_out`,
            labels: [{text: portGroup.name, width: 30, height: 1}],
            ...position,
            layoutOptions: {
              // output ports always on right side
              // this is ignored when portConstraints: FIXED_POS is set but used by other constraint settings
              'elk.port.side': "EAST",
              // how far the port extends beyond the edge of the box
              'elk.port.borderOffset': 15,
            }
          };
        })
      }).flat()
      const inputPorts = fpNode.inputPorts.map((portGroup, portGroupIndex) => {
        return portGroup.portNumbers.map((portNumber, portIndex) => {
          const position = {
            x: 0,
            y: headerHeight + prevPortYOffset,
          }
          prevPortYOffset += lineHeight;
          return {
            id: `${colIndex}_${nodeIndex}_${portGroupIndex}_${portNumber}_in`,
            labels: [{text: portGroup.name, width: columnSize.width, height: 1}],
            ...position,
            layoutOptions: {
              'elk.port.side': "WEST",
              'elk.port.borderOffset': 15,
            },
          };
        })
      }).flat();


      // return an ELK Node object
      return {
        id: `${colIndex}_${nodeIndex}`,
        labels: [ { "text": fpNode.instanceName, "width": 50, "height": 20 } ],
        width: columnSize.width,
        height: nodeHeight,
        ports: [...inputPorts, ...outputPorts],
        layoutOptions: {
          // use fixed positions for the locations of the ports - layout engine can't change port locations on node
          // "FIXED_SIDE" is also allowed and may improve layout, but at the cost of proper ordering of port groups
          "elk.portConstraints": "FIXED_POS",
          "elk.portLabels.placement": "INSIDE",
          "elk.nodeLabels.placement": "H_LEFT V_TOP",
        },
      }
    })
  }).flat();

  const edges = fpGraph.connections.map((fpEdge, edgeIndex) => {
    // the coordinates stored in the fpEdge should match up to the IDs we gave each ELK node
    // todo: validate/check this, catch errors for nonexistent nodes
    const sourceCoords = fpEdge[0];
    const sourceId = `${sourceCoords.join('_')}_out`;
    const targetCoords = fpEdge[1];
    const targetId = `${targetCoords.join('_')}_in`;
    return {id: `edge_${edgeIndex}`, sources: [sourceId], targets: [targetId]};
  })

  const elkGraph = {
    id: "root",
    layoutOptions: {
      // the main layout algorithm - see https://eclipse.dev/elk/reference/algorithms/org-eclipse-elk-layered.html
      'elk.algorithm': 'layered',
      // X spacing between columns ie. layers
      'elk.layered.spacing.nodeNodeBetweenLayers': columnSize.margin,
      // Y spacing between nodes (boxes) in the same column
      'elk.spacing.nodeNode': 20,
      // X & Y spacing between edge lines
      'elk.layered.spacing.edgeEdgeBetweenLayers': 20,
      'elk.spacing.edgeEdge': 15,
      // base value for other spacing values
      'elk.layered.spacing.baseValue': 50,
      // todo add polyline rendering option, with proper angled arrowheads
      // 'elk.edgeRouting': 'POLYLINE',
    },
    children: nodes,
    edges: edges
  }
  return elkGraph;
}

export function drawGraph(elkGraph, context, config) {
  // draw the graph on the canvas element
  console.log('elkGraph', elkGraph);

  elkGraph.children.forEach(node => {
    context.fillStyle = config.component.backgroundColor || "#fff";
    if (config.component.strokeStyle) context.strokeStyle = config.component.strokeStyle;
    roundRect(context, node.x, node.y, node.width, node.height, 5, true, true);

    node.labels.forEach(label => {
      drawNodeLabel(label, node, context, config);
    })
    node.ports.forEach(port => {
      drawPort(port, node, context, config);
    })
  })

  drawEdges(elkGraph, context, config);
}

function drawEdges(elkGraph, context, config) {
  // draw the lines for all edges in the graph
  elkGraph.edges.forEach(edge => {
    (edge.sections || []).forEach(section => {
      const {startPoint, endPoint, bendPoints} = section;
      context.strokeStyle = "#fff";
      context.strokeStyle = config.strokeStyle;
      context.lineWidth = config.lineWidth;

      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      if (bendPoints) {
        bendPoints.forEach((bendPoint, i) => {
          // context.lineTo(bendPoint.x, bendPoint.y);
          const nextPoint = i === bendPoints.length - 1 ? endPoint : bendPoints[i+1];
          context.arcTo(bendPoint.x, bendPoint.y, nextPoint.x, nextPoint.y, config.bendRadius);
        })
      }
      // don't draw line all the way to target box, leave a bit of space for the arrow head
      context.lineTo(endPoint.x - 5, endPoint.y);
      context.stroke();
    })
  })
}

function drawPort(port, node, context, config) {
  const portType = port.id.endsWith('out') ? 'source' : 'target';
  const styles = config.portBox[portType];

  let positionX = node.x + port.x - (config.portBox.size / 2);
  let positionY = node.y + port.y - (config.portBox.size / 2);

  // adjust port position to account for elk.port.borderOffset
  positionX += (portType === 'source') ?
    -(config.portBox.size / 2) :
    (config.portBox.size / 2)

  context.save();
  context.fillStyle = styles.background;
  roundRect(
    context,
    positionX,
    positionY,
    config.portBox.size,
    config.portBox.size,
    config.portBox.borderRadius,
    true,
    false
  );

  if (portType === 'target') {
    drawPortTargetTriangle({x: node.x + port.x, y: node.y + port.y}, context, config);
  }

  (port.labels || []).forEach(label => {
    // render the port number label on each port
    let positionX = node.x + port.x + label.x;
    let positionY = node.y + port.y + label.y;

    // todo remove this & replace with better option
    if (portType === 'target') positionX += 25;

    context.save();
    context.fillStyle = styles.nameColor;
    context.textAlign = (portType === 'source') ? "right" : "left";
    // context.font = font;

    // Component (left top)
    context.fillText(
      // TODO: trim long names (see trimText)
      label.text,
      positionX,
      positionY
    );
    context.restore();
  });

  // render the port index number
  const portNumber = port.id.split('_')[3];
  const portNumLabelX = (node.x + port.x) +
    ((config.portBox.size / 2) * (portType === 'target' ? 1 : -1));
  const portNumLabelY = (node.y + port.y);

  context.font = config.portBox.font;
  context.fillStyle = styles.numberColor;
  context.textAlign = "center";

  context.fillText(portNumber, portNumLabelX, portNumLabelY);
  context.restore();
}


function drawPortTargetTriangle(position, context, config) {
  const {
    size,
    targetFillStyle,
    targetWidth: width,
    targetHeight: height
  } = config.portBox;

  context.fillStyle = targetFillStyle;
  context.beginPath();
  context.moveTo(position.x - width, position.y - (height / 2));
  context.lineTo(position.x, position.y);
  context.lineTo(position.x - width, position.y + (height) / 2);
  context.fill();
}

export function drawNodeLabel(label, node, context, config) {
  const {lineHeight} = config.component;
  const {color, align, font} = config.component.title;
  context.save();
  context.fillStyle = color;
  context.textAlign = align;
  context.font = font;

  // Component (left top)
  context.fillText(
    // TODO: trim long names (see trimText)
    // this.trimText(instanceName),
    label.text || "Unknown",
    Math.floor(node.x + label.x + 25), //this.columnSize.padding.x,
    Math.floor(node.y + label.y + (lineHeight * 0.5)) //this.columnSize.padding.y
  );
  context.restore();
}

/**
 * Render the graph visualization
 * @param {GraphData} data - Parsed data object from the API
 * @param {string} canvasId - ID of the existing <canvas> element to render within
 */
export function render(data, canvasId = 'fprime-graph') {
  // determine the size of the canvas
  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns, config)
  };
  // transform our FP graph data structure to an ELK graph object
  const elk = new ELK();
  const elkGraph = toElkGraph(data, size);
  console.log("elkGraph", elkGraph);

  // run the ELK layout algorithm on the ELK graph and render the result
  elk.layout(elkGraph)
    .then((graphWithLayout) => {
      // setup canvas to use size from elk layout, which may be bigger than original size
      // force integer width & height - fractional canvas size causes blurry rendering
      const size = {width: Math.ceil(elkGraph.width), height: Math.ceil(elkGraph.height)};
      const context = setupCanvas(size, canvasId, config);
      drawGraph(graphWithLayout, context, config);
    })
    .catch(console.error)
}

// example ELK graph used for testing, uncomment if needed
// const elkTestGraph = {
//   id: "root",
//   layoutOptions: { 'elk.algorithm': 'layered' },
//   children: [
//     {
//       id: "n1",
//       width: 30,
//       height: 60,
//       "layoutOptions": { "elk.portConstraints": "FIXED_SIDE" },
//       ports: [
//         {id: "p1"},
//         {id: "p2"},
//       ]
//     },
//     { id: "n2", width: 30, height: 30, ports: [{id: "p3"}]},
//     { id: "n3", width: 30, height: 30, ports: [{id: "p4"}]},
//   ],
//   edges: [
//     { id: "e1", sources: [ "p1" ], targets: [ "p3" ] },
//     { id: "e2", sources: [ "p2" ], targets: [ "p4" ] }
//   ]
// }
