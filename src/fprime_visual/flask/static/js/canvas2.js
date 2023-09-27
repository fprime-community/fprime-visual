import {calculateHeight, componentHeight, getColumnSize} from "./layout/basic-layout.js";
import {setupCanvas} from "./canvas.js";
// JSDoc typedefs defining data types, see typedefs file for details
import "./typedefs.js";
import {drawGraph} from "./v2/renderers/render-elk";

// DRAFT VERSION of alternate graph rendering using elkjs layout engine

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
  lineWidth: 1,
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
      // Since GraphData.connections refers to them this way
      // TODO add port locations
      const inputPorts = fpNode.inputPorts.map((portGroup, portGroupIndex) => {
        return portGroup.portNumbers.map((portNumber, portIndex) => {
          return {
            id: `${colIndex}_${nodeIndex}_${portGroupIndex}_${portIndex}_in`,
            labels: [{text: portGroup.name, width: columnSize.width, height: 1}],
            // width: config.portBox.size,
            // height: config.portBox.size,
            layoutOptions: {
              'elk.port.side': "WEST",
              // 'elk.port.anchor': '[-5, 0]'
              'elk.port.borderOffset': 15,
            },
          };
        })
      }).flat();
      const outputPorts = fpNode.outputPorts.map((portGroup, portGroupIndex) => {
        return portGroup.portNumbers.map((portNumber, portIndex) => {
          return {
            id: `${colIndex}_${nodeIndex}_${portGroupIndex}_${portIndex}_out`,
            labels: [{text: portGroup.name, width: 30, height: 1}],
            layoutOptions: {
              'elk.port.side': "EAST",
              // 'elk.port.anchor': '[15, 0]'
              'elk.port.borderOffset': 15,
              // width: columnSize.width
            }
          };
        })
      }).flat()

      // return an ELK Node object
      return {
        id: `${colIndex}_${nodeIndex}`,
        labels: [ { "text": fpNode.instanceName, "width": 50, "height": 20 } ],
        width: columnSize.width,
        height: nodeHeight,
        ports: [...inputPorts, ...outputPorts],
        layoutOptions: {
          "elk.portConstraints": "FIXED_SIDE",
          // "elk.portConstraints": "FIXED_POSITION",
          "elk.portLabels.placement": "INSIDE",

          "elk.nodeLabels.placement": "H_LEFT V_TOP",
          "elk.nodeLabels.padding": 30,
          "elk.spacing.labelNode": 30
        },
      }
    })
  }).flat();

  const edges = fpGraph.connections.map((fpEdge, edgeIndex) => {
    const sourceCoords = fpEdge[0];
    console.log('sourceCoords', sourceCoords);
    const sourceId = `${sourceCoords.join('_')}_out`;
    const targetCoords = fpEdge[1];
    const targetId = `${targetCoords.join('_')}_in`;
    return {id: `edge_${edgeIndex}`, sources: [sourceId], targets: [targetId]};
  })
  console.log('edges', edges);


  const elkGraph = {
    id: "root",
    layoutOptions: {
      'elk.algorithm': 'layered',
      'layered.spacing.nodeNodeBetweenLayers': columnSize.margin,
      // 'elk.spacing.portsSurrounding': '[top=25]',
      // 'elk.edgeRouting': 'POLYLINE',
      // 'elk.spacing.edgeEdge': 50.0,
      // 'elk.spacing.edgeNode': 65.0
      'layered.spacing.edgeEdgeBetweenLayers': 20,
      // 'layered.wrapping.additionalEdgeSpacing': 10
    },
    children: nodes,
    edges: edges
  }
  return elkGraph;
}


/**
 * Render the graph visualization
 * @param {GraphData} data - Parsed data object from the API
 */
export function render(data, canvasId = 'fprime-graph2') {
  // determine the size of the canvas
  const size = {
    width: window.innerWidth,
    height: calculateHeight(data.columns, config)
  };
  // transform our FP graph data structure to an ELK graph object
  const elk = new ELK();
  const elkGraph = toElkGraph(data, size);

  // create & setup the canvas element/context
  const context = setupCanvas(size, canvasId);

  // run the ELK layout algorithm on the ELK graph and render the result
  elk.layout(elkGraph)
    .then((graphWithLayout) => {
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
