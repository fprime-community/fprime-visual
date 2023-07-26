
// JSDoc type definitions for our data

/**
 * A PortGroup represents a named group of ports on a graph component.
 * A port is an input or output node of a component that may be connected to other ports in the graph.
 * The group shares a single name, but each port has a unique number defined by `portNumbers`
 * @typedef {Object} PortGroup
 * @property {string} name - The name of the port group
 * @property {Array<number>} portNumbers - The port numbers for each port in the group
 */
/**
 * A GraphComponent is a named container in the graph, with input and output port groups,
 * represented in the diagram by a rectangle in which all component ports are contained.
 * @typedef {Object} GraphComponent
 * @property {string} instanceName - The name of the component
 * @property {Array<PortGroup>} inputPorts - The component's input port groups
 * @property {Array<PortGroup>} outputPorts - The component's output port groups
 */
/**
 * PortCoordinates describe how to find a particular port in the GraphComponent structure
 * These are not pixel coordinates, but indices for accessing the port
 * within the arrays of columns, rows and portGroups in a GraphComponent ( TODO describe further ?? )
 * @typedef {[number, number, number, number]} PortCoordinates
 */
/**
 * GraphData represents the entire data object we get from the server:
 * all components in the graph, ordered by column and row location, and their port groups
 * and all connections between the ports
 * @typedef {Object} GraphData
 * @property {Array<Array<GraphComponent>>} columns
 * @property {Array<[PortCoordinates, PortCoordinates]>} connections
 */

// export empty object, all typedefs will be included automatically when imported
export {};