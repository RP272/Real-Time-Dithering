import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance } from "@p5-wrapper/react";

const newPixelValue = (value: number, error: number) => {
  if (value + error < 0) return 0;
  if (value + error > 255) return 255;
  return value + error;
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

    const histogram:any = {};
    p5.image(video, 0, 0);
    p5.loadPixels();
    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        const index = (x + y * video.width) * 4;
        const r = p5.pixels[index];
        const g = p5.pixels[index + 1];
        const b = p5.pixels[index + 2];
        const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        const quantized = brightness > 127 ? 255 : 0;
        const error = brightness - quantized;
        p5.pixels[index] = quantized;
        p5.pixels[index + 1] = quantized;
        p5.pixels[index + 2] = quantized;
        histogram[quantized] = (histogram[quantized] || 0) + 1;

        if (x + 1 < video.width) {
          const idxRight = index + 4;
          const rRight = p5.pixels[idxRight];
          const gRight = p5.pixels[idxRight + 1];
          const bRight = p5.pixels[idxRight + 2];
          const brightnessRight =
            0.2126 * rRight + 0.7152 * gRight + 0.0722 * bRight;
          const newBrightnessRight = newPixelValue(
            brightnessRight,
            (error * 7) / 16
          );
          p5.pixels[idxRight] = newBrightnessRight;
          p5.pixels[idxRight + 1] = newBrightnessRight;
          p5.pixels[idxRight + 2] = newBrightnessRight;
        }
        if (x - 1 >= 0 && y + 1 < video.height) {
          const idxBottomLeft = index + (video.width - 1) * 4;
          const rBottomLeft = p5.pixels[idxBottomLeft];
          const gBottomLeft = p5.pixels[idxBottomLeft + 1];
          const bBottomLeft = p5.pixels[idxBottomLeft + 2];
          const brightnessBottomLeft =
            0.2126 * rBottomLeft + 0.7152 * gBottomLeft + 0.0722 * bBottomLeft;
          const newBrightnessBottomLeft = newPixelValue(
            brightnessBottomLeft,
            (error * 3) / 16
          );
          p5.pixels[idxBottomLeft] = newBrightnessBottomLeft;
          p5.pixels[idxBottomLeft + 1] = newBrightnessBottomLeft;
          p5.pixels[idxBottomLeft + 2] = newBrightnessBottomLeft;
        }
        if (y + 1 < video.height) {
          const idxBottom = index + video.width * 4;
          const rBottom = p5.pixels[idxBottom];
          const gBottom = p5.pixels[idxBottom + 1];
          const bBottom = p5.pixels[idxBottom + 2];
          const brightnessBottom =
            0.2126 * rBottom + 0.7152 * gBottom + 0.0722 * bBottom;
          const newBrightnessBottom = newPixelValue(
            brightnessBottom,
            (error * 5) / 16
          );
          p5.pixels[idxBottom] = newBrightnessBottom;
          p5.pixels[idxBottom + 1] = newBrightnessBottom;
          p5.pixels[idxBottom + 2] = newBrightnessBottom;
        }
        if (x + 1 < video.width && y + 1 < video.height) {  
          const idxBottomRight = index + (video.width + 1) * 4;
          const rBottomRight = p5.pixels[idxBottomRight];
          const gBottomRight = p5.pixels[idxBottomRight + 1];
          const bBottomRight = p5.pixels[idxBottomRight + 2];
          const brightnessBottomRight =
            0.2126 * rBottomRight + 0.7152 * gBottomRight + 0.0722 * bBottomRight;
          const newBrightnessBottomRight = newPixelValue(
            brightnessBottomRight,
            (error * 1) / 16
          );
          p5.pixels[idxBottomRight] = newBrightnessBottomRight;
          p5.pixels[idxBottomRight + 1] = newBrightnessBottomRight;
          p5.pixels[idxBottomRight + 2] = newBrightnessBottomRight;
        } 
      }
    }
    p5.updatePixels();
    console.log(histogram);
  };
};

export default function Dithering() {
  return <P5Canvas sketch={sketch} />;
}
