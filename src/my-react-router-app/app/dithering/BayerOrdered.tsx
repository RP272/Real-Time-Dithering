import { P5Canvas } from "@p5-wrapper/react";
import type { P5CanvasInstance, SketchProps } from "@p5-wrapper/react";
import { useRef, useState } from "react";
import { Link } from "react-router";

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
  bayerSize: number;
  onFPSChange?: (fps: number) => void;
};

const sketch = (p5: P5CanvasInstance<MySketchProps>) => {
  let ditheringOn: boolean = false;
  let bayerSize: number = 0;
  let video: any;
  let onFPSChange: ((fps: number) => void) | undefined = undefined;
  const WIDTH = 320;
  const HEIGHT = 240;

  let bayerMatrix: Array<Array<number>> = [[]];

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
    if (props.bayerSize !== undefined) {
      bayerSize = props.bayerSize;
      if (bayerSize == 2) {
        bayerMatrix = [
          [0, 2],
          [3, 1],
        ];
      } else if (bayerSize == 4) {
        bayerMatrix = [
          [0, 8, 2, 10],
          [12, 4, 14, 6],
          [3, 11, 1, 9],
          [15, 7, 13, 5],
        ];
      } else if (bayerSize == 8) {
        bayerMatrix = [
          [0, 32, 8, 40, 2, 34, 10, 42],
          [48, 16, 56, 24, 50, 18, 58, 26],
          [12, 44, 4, 36, 14, 46, 6, 38],
          [60, 28, 52, 20, 62, 30, 54, 22],
          [3, 35, 11, 43, 1, 33, 9, 41],
          [51, 19, 59, 27, 49, 17, 57, 25],
          [15, 47, 7, 39, 13, 45, 5, 37],
          [63, 31, 55, 23, 61, 29, 53, 21],
        ];
      }
      const constant = 1 / (bayerSize * bayerSize);
      for (let i = 0; i < bayerSize; i++) {
        for (let j = 0; j < bayerSize; j++) {
          bayerMatrix[i][j] *= constant * 256;
        }
      }
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

    if (!ditheringOn || bayerSize == 0) return;
    p5.loadPixels();

    for (let y = 0; y < video.height; y++) {
      for (let x = 0; x < video.width; x++) {
        const brightness = getBrightness(x, y, p5);
        const yIdx = y % bayerSize;
        const xIdx = x % bayerSize;
        setBrightness(x, y, p5, brightness > bayerMatrix[yIdx][xIdx] ? 255 : 0);
      }
    }
    p5.updatePixels();
  };
};

export default function BayerOrdered() {
  const [ditheringOn, setDitheringOn] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  const [bayerSize, setBayerSize] = useState(2);
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

      <h1 className="text-2xl mb-5">Bayer Ordered Dithering</h1>

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

        <div>
          <label>Bayer Matrix Size:</label>
          <div className="flex flex-col">
            <div>
              <input
                className="mr-3"
                name="bayerSize"
                type="radio"
                checked={bayerSize == 2}
                onChange={() => setBayerSize(2)}
              />
              2
            </div>
            <div>
              <input
                className="mr-3"
                name="bayerSize"
                type="radio"
                checked={bayerSize == 4}
                onChange={() => setBayerSize(4)}
              />
              4
            </div>
            <div>
              <input
                className="mr-3"
                name="bayerSize"
                type="radio"
                checked={bayerSize == 8}
                onChange={() => setBayerSize(8)}
              />
              8
            </div>
          </div>
        </div>
      </div>

      <P5Canvas
        sketch={sketch}
        ditheringOn={ditheringOn}
        bayerSize={bayerSize}
        onFPSChange={handleFPS}
/>
    </div>
  );
}
