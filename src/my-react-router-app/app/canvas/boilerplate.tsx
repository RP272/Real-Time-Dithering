import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance } from "@p5-wrapper/react";

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
        const index = (x + y * video.width) * 4;
        const r = p5.pixels[index];
        const g = p5.pixels[index + 1];
        const b = p5.pixels[index + 2];
        const bright = (0.2126 * r) + (0.7152 * g) + (0.0722 * b) > 127 ? 255 : 0;

        p5.pixels[index] = bright;
        p5.pixels[index + 1] = bright;
        p5.pixels[index + 2] = bright;
      }
    }
    p5.updatePixels();
  };
};

export default function Dithering() {
  return <P5Canvas sketch={sketch} />;
}
