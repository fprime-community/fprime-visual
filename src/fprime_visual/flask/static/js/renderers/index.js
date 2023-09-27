import {render as renderBasic} from './render-basic.js';
import {render as renderElk} from './render-elk.js';

export const renderers = {
  elkLayered: {
    name: "Layered (ELK)",
    render: renderElk
  },
  basic: {
    name: "Basic Layout",
    render: renderBasic
  }
};