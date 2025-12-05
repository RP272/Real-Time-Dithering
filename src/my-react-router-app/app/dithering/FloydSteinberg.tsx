import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { useRef, useState } from "react";
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
  onFPSChange?: (fps: number) => void;
};

const sketch = (p5: P5CanvasInstance<MySketchProps>) => {
  let ditheringOn: boolean = false;
  let video: any;
  let onFPSChange: ((fps: number) => void) | undefined = undefined;
  const WIDTH = 320;
  const HEIGHT = 240;

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
    }
    if (props.onFPSChange !== undefined) {
      onFPSChange = props.onFPSChange;
    }
  };

  p5.draw = () => {
    p5.translate(video.width, 0);
    p5.scale(-1, 1);

    p5.image(video, 0, 0);

    p5.scale(-1, 1);
    p5.translate(-video.width, 0);

    const FPS = p5.frameRate();
    onFPSChange?.(FPS);

    if (!ditheringOn) return;
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

export default function FloydSteinberg() {
  const [ditheringOn, setDitheringOn] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  const fpsRef = useRef<HTMLDivElement | null>(null);
  const handleFPS = (fps: number) => {
    if (fpsRef.current) fpsRef.current.textContent = ` FPS: ${fps.toFixed(2)}`;
  };
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center font-[Typewriter]">
      <Link to="/">
        <button className="cursor-pointer absolute top-1 left-1 text-black p-2 bg-white rounded-md hover:bg-gray-200">
          Back to Home
        </button>
      </Link>

      <h1 className="text-2xl mb-5">Floyd-Steinberg Dithering</h1>

      <div
        hidden={!showFPS}
        ref={fpsRef}
        className="text-black bg-white p-1 rounded text-2xl mb-5 font-mono"
      >
        FPS: 0.00
      </div>

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

      <P5Canvas
        sketch={sketch}
        ditheringOn={ditheringOn}
        onFPSChange={handleFPS}
      />
    </div>
  );
}
