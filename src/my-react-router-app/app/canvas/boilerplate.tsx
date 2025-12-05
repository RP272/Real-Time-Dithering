import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance } from "@p5-wrapper/react";

const newPixelValue = (value: number, error: number) => {
  if (value + error < 0) return 0;
  if (value + error > 255) return 255;
  return value + error;
};

const getBrightness = (x: number, y: number, p5: P5CanvasInstance) => {
  const index = (x + y * p5.width) * 4;
  const r = p5.pixels[index];
  const g = p5.pixels[index + 1];
  const b = p5.pixels[index + 2];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const setBrightness = (
  x: number,
  y: number,
  p5: P5CanvasInstance,
  value: number
) => {
  const index = (x + y * p5.width) * 4;
  p5.pixels[index] = value;
  p5.pixels[index + 1] = value;
  p5.pixels[index + 2] = value;
};

const sketch = (p5: P5CanvasInstance) => {
  let video: any;
  const WIDTH = 320;
  const HEIGHT = 240;
  p5.setup = () => {
    p5.createCanvas(WIDTH, HEIGHT, p5.P2D);
    p5.pixelDensity(1);
    video = p5.createCapture(p5.VIDEO);
    video.size(WIDTH, HEIGHT);
    video.hide();
  };

  p5.draw = () => {
    p5.translate(video.width, 0);
    p5.scale(-1, 1);

    p5.image(video, 0, 0);
    p5.loadPixels();
    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        const brightness = getBrightness(x, y, p5);
        const quantized = brightness > 127 ? 255 : 0;
        const error = brightness - quantized;
        setBrightness(x, y, p5, quantized);

        if (x + 1 < video.width) {
          const brightnessRight = getBrightness(x + 1, y, p5);
          const newBrightnessRight = newPixelValue(
            brightnessRight,
            (error * 7) / 16
          );
          setBrightness(x + 1, y, p5, newBrightnessRight);
        }
        if (x - 1 >= 0 && y + 1 < video.height) {
          const brightnessBottomLeft = getBrightness(x - 1, y + 1, p5);
          const newBrightnessBottomLeft = newPixelValue(
            brightnessBottomLeft,
            (error * 3) / 16
          );
          setBrightness(x - 1, y + 1, p5, newBrightnessBottomLeft);
        }
        if (y + 1 < video.height) {
          const brightnessBottom = getBrightness(x, y + 1, p5);
          const newBrightnessBottom = newPixelValue(
            brightnessBottom,
            (error * 5) / 16
          );
          setBrightness(x, y + 1, p5, newBrightnessBottom);
        }
        if (x + 1 < video.width && y + 1 < video.height) {
          const brightnessBottomRight = getBrightness(x + 1, y + 1, p5);
          const newBrightnessBottomRight = newPixelValue(
            brightnessBottomRight,
            (error * 1) / 16
          );
          setBrightness(x + 1, y + 1, p5, newBrightnessBottomRight);
        }
      }
    }
    p5.updatePixels();
  };
};

export default function Dithering() {
  return <P5Canvas sketch={sketch} />;
}
