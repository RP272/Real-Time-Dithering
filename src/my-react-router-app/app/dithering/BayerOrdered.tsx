import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { useState } from "react";
import { Link } from "react-router";

const newPixelValue = (value: number, error: number) => {
  if (value + error < 0) return 0;
  if (value + error > 255) return 255;
  return value + error;
};

const getBrightness = (
  x: number,
  y: number,
  p5: P5CanvasInstance<MySketchProps>
) => {
  const index = (x + y * p5.width) * 4;
  const r = p5.pixels[index];
  const g = p5.pixels[index + 1];
  const b = p5.pixels[index + 2];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const setBrightness = (
  x: number,
  y: number,
  p5: P5CanvasInstance<MySketchProps>,
  value: number
) => {
  const index = (x + y * p5.width) * 4;
  p5.pixels[index] = value;
  p5.pixels[index + 1] = value;
  p5.pixels[index + 2] = value;
};

type MySketchProps = SketchProps & {
  ditheringOn: boolean;
  showFPS: boolean;
};

const sketch = (p5: P5CanvasInstance<MySketchProps>) => {
  let ditheringOn: boolean = false;
  let showFPS: boolean = true;
  let video: any;
  const WIDTH = 320;
  const HEIGHT = 240;
  
  const bayerMatrix = [
    [0, 2],
    [3, 1]
  ];

  p5.setup = () => {
    p5.createCanvas(WIDTH, HEIGHT, p5.P2D);
    p5.frameRate(60);
    p5.pixelDensity(1);
    video = p5.createCapture(p5.VIDEO);
    video.size(WIDTH, HEIGHT);
    video.hide();
  };

  p5.updateWithProps = (props) => {
    if (props.ditheringOn !== undefined) {
      ditheringOn = props.ditheringOn;
      showFPS = props.showFPS;
    }
  };

  p5.draw = () => {
    p5.translate(video.width, 0);
    p5.scale(-1, 1);

    p5.image(video, 0, 0);

    p5.scale(-1, 1);
    p5.translate(-video.width, 0);

    if (showFPS) {
      const FPS = p5.frameRate();
      p5.fill(255, 255, 255);
      p5.textSize(20);
      p5.text(`FPS: ${FPS.toFixed(2)}`, 10, 20);
    }

    if (!ditheringOn) return;
    p5.loadPixels();

    // TODO: Implement Bayer Ordered Dithering

    p5.updatePixels();
  };
};

export default function BayerOrdered() {
  const [ditheringOn, setDitheringOn] = useState(false);
  const [showFPS, setShowFPS] = useState(true);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center font-[Typewriter]">
      <Link to="/">
        <button className="cursor-pointer absolute top-1 left-1 text-black p-2 bg-white rounded-md hover:bg-gray-200">
          Back to Home
        </button>
      </Link>

      <h1 className="text-2xl mb-10">Bayer Ordered Dithering</h1>

      <div className="flex flex-col absolute top-1 right-1 text-white p-1">
        <div>
          <input
            className="mr-3"
            id="ditheringToggle"
            type="checkbox"
            checked={ditheringOn}
            onChange={() => setDitheringOn(!ditheringOn)}
          />
          <label htmlFor="ditheringToggle">Toggle Dithering</label>
        </div>

        <div>
          <input
            className="mr-3"
            id="fpsToggle"
            type="checkbox"
            checked={showFPS}
            onChange={() => setShowFPS(!showFPS)}
          />
          <label htmlFor="fpsToggle">Show FPS</label>
        </div>
      </div>

      <P5Canvas sketch={sketch} ditheringOn={ditheringOn} showFPS={showFPS} />
    </div>
  );
}
