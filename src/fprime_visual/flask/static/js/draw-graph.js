
// All the code for drawing/rendering an ELK graph on a canvas.
// These functions do NOT do any layout (positioning), they are given an already-laid-out
// ELK graph data structure and draw it on the given canvas context



import {drawNodeLabel} from "./v2/renderers/render-elk";

export function drawGraph(elkGraph, context, config) {
  // draw the graph on the canvas element

  console.log('elkGraph', elkGraph);
  elkGraph.children.forEach(node => {
    console.log('draw', node);
    // context.fillStyle = "#fff";
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

  elkGraph.edges.forEach(edge => {
    (edge.sections || []).forEach(section => {
      const {startPoint, endPoint, bendPoints} = section;
      context.strokeStyle = "#fff";
      context.strokeStyle = config.strokeStyle;

      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      if (bendPoints) {
        bendPoints.forEach(bendPoint => {
          context.lineTo(bendPoint.x, bendPoint.y);
        })
      }
      context.lineTo(endPoint.x, endPoint.y);
      context.stroke();
    })
  })
}

function drawPort(port, node, context, config) {
  console.log('port', port);
  const portType = port.id.endsWith('out') ? 'source' : 'target';
  console.log(portType);
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

  if (portType === 'source') {
    // drawPortSourceLine({x: node.x + port.x, y: node.y + port.y}, context, config);
  } else {
    drawPortTargetTriangle({x: node.x + port.x, y: node.y + port.y}, context, config);
  }

  (port.labels || []).forEach(label => {
    console.log('port label', label, portType)
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
      // this.trimText(instanceName),
      label.text,
      positionX,
      positionY
    );
    context.restore();
  });
}

function drawPortSourceLine(position, context, config) {
  const {
    size,
    sourceWidth: width,
    sourceHeight: height,
    sourceFillStyle: fillStyle
  } = config.portBox;

  // Source small line
  context.fillStyle = fillStyle;
  context.fillRect(
    position.x - width,
    position.y - (height / 2),
    width,
    height
  );
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
  context.lineTo(position.x, position.y + .5);
  context.lineTo(position.x - width, position.y + (height) / 2 + .5);
  context.fill();
}
