import {componentHeight} from "../../layouts/basic-layout.js";
import {roundRect} from "./render-utils.js";

// Box & port rendering class used by the basic (non-ELK) layout.
// Not recommended for use with new layouts, since it is closely tied
// to the original layout & mutates the data while rendering.

export class Box {
  constructor(element, position, columnSize, connections, coordinates, context, config) {
    // Attr
    this.element = element;
    this.position = position;
    this.columnSize = columnSize;
    this.context = context;
    this.config = config;
    this.coordinates = coordinates;
    this.connections = connections;

    this.createBox();
    this.createPortBoxes();
  }

  trimText(instanceName, availWidth) {
    // If availWidth is undefined/falsy, then its value is this.getAvailableSpace()
    availWidth = availWidth || this.getAvailableSpace()
    const titleWidth = this.context.measureText(instanceName).width;
    
    if (titleWidth > availWidth) {
      // Figure out how to reduce char count
      const avgCharWidth = this.context.measureText(instanceName).width / instanceName.length
      const letterCount = Math.floor(availWidth / avgCharWidth);
      instanceName = instanceName.slice(0, letterCount - 2) + "...";
    }

    return instanceName;
  }

  createBox() {
    const { element, position, columnSize, context, config } = this;
    const { instanceName } = element;
    
    // Box
    context.fillStyle = config.component.backgroundColor;
    roundRect(
      context,
      position.x,
      position.y,
      columnSize.width,
      componentHeight(element, config),
      config.portBox.borderRadius,
      true,
      false
    );

    const { color, align, font } = config.component.title;

    // Text
    // TODO: Box titles need to be bold.
    context.save();
    context.fillStyle = color;
    context.textAlign = align;
    context.font = font;


    // Component (left top)
    context.fillText(
      this.trimText(instanceName),
      position.x + this.columnSize.padding.x,
      position.y + this.columnSize.padding.y
    );
    context.restore();
  }
  // TODO run measureText on Title to get width, 
  // TODO then subtract 2 * padding

  getAvailableSpace() {
    const {columnSize} = this;
    const availableSpace = columnSize.width - columnSize.padding.x * 2;
    return availableSpace;
  }

  createPortBoxes() {
    let { outputPorts, inputPorts } = this.element;

    // Try to rewrite this to make it more readable
    const mapPort = (portType, previousPorts, portGroup, portGroupIndex) => {
      const portsList = portGroup.portNumbers;

      const newPortGroup = portsList.map(num => {
        return {
          num, // port index
          portType, // source/target
          port: portGroup.name, // Port group name
          showPortName: num === 0, // Only true for first elements in group
          coordinates: [...this.coordinates, portGroupIndex, num]
        };
      });

      return [...previousPorts, ...newPortGroup];
    };

    // Map sources => create new object from each source,
    // adding port and portType
    outputPorts = outputPorts.reduce(mapPort.bind(null, "source"), []);
    inputPorts = inputPorts.reduce(mapPort.bind(null, "target"), []);
  
    // Get input and output ports together in only 1 array
    const allPorts = [...outputPorts, ...inputPorts];
    
    // Create all the ports for this instance
    // Another version: allPorts.forEach(this.createPortBox);
    allPorts.forEach((box, index) => {
      this.createPortBox(box, index);
    });
  }

  sourceLine(position) {
    const {config} = this;
    const {
      size,
      sourceWidth: width,
      sourceHeight: height,
      sourceFillStyle: fillStyle
    } = config.portBox;

    // Source small line
    this.context.fillStyle = fillStyle;
    this.context.fillRect(
      position.x + size - width,
      position.y + (size - height) / 2,
      width,
      height
      );
  }

  targetTriangle(position) {
      const { context, config } = this
      const {
        size,
        targetFillStyle,
        targetWidth: width,
        targetHeight: height
      } = config.portBox;

      this.context.fillStyle = targetFillStyle;
      context.beginPath();
      context.moveTo(position.x - width, position.y + (size - height) / 2);
      context.lineTo(position.x, position.y + size / 2);
      context.lineTo(position.x - width, position.y + (height + size) / 2);
      context.fill();
  }

  createPortBox(box, index) {
    const { position: parentPosition, columnSize, context, config } = this;
    const { num, port, showPortName } = box;
  
    const styles = config.portBox[box.portType];
    const align = box.portType === 'source' ? 'right' : 'left';

    // Gets box position
    const boxCenter = config.portBox.size / 2;
    const positionX =
      align === "right"
        ? parentPosition.x + columnSize.width - boxCenter
        : parentPosition.x - boxCenter;
    const margin =
      align === "right"
        ? -config.component.marginBottom
        : config.component.marginBottom + config.portBox.size;

    const positionY = parentPosition.y + config.component.lineHeight * (index + 1);
    const position = {x: positionX, y: positionY};

    this.connections.forEach((connection) => {
      // TODO move this logic elsewhere - box renderer shouldn't mutate connections
      // TODO use relative coords to match ELK format
      let [source, target] = connection
      target = target.toString();
      source = source.toString();
      const { coordinates, portType } = box;
      const coords = coordinates.toString();

      if (
        (portType === 'target' && coords === target) ||
        (portType === 'source' && coords === source)
      ) { 

        const position = {
          x: positionX + boxCenter,
          y: positionY + boxCenter,
        };

        const cIndex = portType === 'source' ? 0 : 1;
        connection[cIndex] = position;
      }

    });
    context.save();

    // Box
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

    if (box.portType === "source") {
      this.sourceLine(position);
    } else {
      this.targetTriangle(position);
    }

    // Port name (right bottom)
    if (showPortName) {
      context.fillStyle = styles.nameColor;
      context.textAlign = align;
      context.fillText(
        this.trimText(port, this.getAvailableSpace() - config.portBox.size), 
        positionX + margin, 
        positionY + config.portBox.size / 2
      );
    }

    // Port number (right bottom)
    context.font = config.portBox.font;
    context.fillStyle = styles.numberColor;
    context.textAlign = "center";
    context.fillText(num, positionX + boxCenter, positionY + boxCenter);
    context.restore();
  }
}
