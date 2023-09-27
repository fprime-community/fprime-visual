export function setupCanvas(size, canvasId, config) {
  // handle high-DPI displays
  const dpi = window.devicePixelRatio;
  const canvas = document.querySelector(`canvas#${canvasId}`);
  canvas.width = size.width * dpi;
  canvas.height = size.height * dpi;
  canvas.style.width = size.width + 'px';
  canvas.style.height = size.height + 'px';
  canvas.style.background = config.canvasBackground;
  document.body.style.background = config.canvasBackground;

  // Gets context
  const context = canvas.getContext("2d");
  // Sets global configuration
  context.textBaseline = "middle";
  // Sets DPI
  context.setTransform(dpi, 0, 0, dpi, 0, 0);

  return context
}
