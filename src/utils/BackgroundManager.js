export class BackgroundManager {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.layers = [];
  }

  // Call this once to add your images
  addLayer(image, speedMultiplier) {
    this.layers.push({
      image,
      x: 0,
      speedMultiplier,
      width: image.width
    });
  }

  update(gameSpeedMultiplier) {
    this.layers.forEach(layer => {
      // Calculate speed based on layer depth
      layer.x -= layer.speedMultiplier * gameSpeedMultiplier;

      // Loop logic: if the image has scrolled off, reset it
      if (layer.x <= -layer.width) {
        layer.x = 0;
      }
    });
  }

  draw(ctx) {
    this.layers.forEach(layer => {
      // Draw first instance
      ctx.drawImage(layer.image, layer.x, 0, layer.width, this.canvasHeight);
      // Draw second instance to fill the gap created by movement
      ctx.drawImage(layer.image, layer.x + layer.width, 0, layer.width, this.canvasHeight);
    });
  }
}