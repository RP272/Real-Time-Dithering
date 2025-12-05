import { jsx, jsxs } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts, Link } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { P5Canvas } from "@p5-wrapper/react";
import { useState, useRef } from "react";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  if (request.method.toUpperCase() === "HEAD") {
    return new Response(null, {
      status: responseStatusCode,
      headers: responseHeaders
    });
  }
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    let timeoutId = setTimeout(
      () => abort(),
      streamTimeout + 1e3
    );
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = void 0;
              callback();
            }
          });
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          pipe(body);
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
function Welcome() {
  return /* @__PURE__ */ jsxs("main", { className: "flex flex-col items-center justify-center pt-16 pb-4 font-[Typewriter] h-dvh", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-3xl font-bold mb-4 text-center", children: "Welcome to Real-Time Dithering" }),
    /* @__PURE__ */ jsx("h2", { className: "text-xl mb-4 text-center", children: "Try out below versions:" }),
    /* @__PURE__ */ jsxs("ul", { className: "list-disc ditheringLinks", children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { className: "italic text-center", to: "/FloydSteinberg", children: "Floyd-Steinberg Dithering" }) }),
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(Link, { className: "italic text-center", to: "/BayerOrdered", children: "Bayer Ordered Dithering" }) })
    ] }),
    /* @__PURE__ */ jsx("img", { className: "mt-10", src: "https://64.media.tumblr.com/6e11dfdb4db8fdec29802e412072af28/tumblr_nhrls6xYjy1r36t2xo1_500.gif", alt: "dithered cat" })
  ] });
}
function meta({}) {
  return [{
    title: "New React Router App"
  }, {
    name: "description",
    content: "Welcome to React Router!"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  return /* @__PURE__ */ jsx(Welcome, {});
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const newPixelValue = (value, error) => {
  if (value + error < 0) return 0;
  if (value + error > 255) return 255;
  return value + error;
};
const getBrightness$1 = (x, y, p5) => {
  const index = (x + y * p5.width) * 4;
  const r = p5.pixels[index];
  const g = p5.pixels[index + 1];
  const b = p5.pixels[index + 2];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const setBrightness$1 = (x, y, p5, value) => {
  const index = (x + y * p5.width) * 4;
  p5.pixels[index] = value;
  p5.pixels[index + 1] = value;
  p5.pixels[index + 2] = value;
};
const sketch$1 = (p5) => {
  let ditheringOn = false;
  let video;
  let onFPSChange = void 0;
  const WIDTH = window.screen.width > window.screen.height ? 320 : 240;
  const HEIGHT = window.screen.width > window.screen.height ? 240 : 320;
  p5.setup = () => {
    p5.createCanvas(WIDTH, HEIGHT, p5.P2D);
    p5.frameRate(60);
    p5.pixelDensity(1);
    video = p5.createCapture(p5.VIDEO);
    video.size(WIDTH, HEIGHT);
    video.hide();
    const saveButton = p5.select("#savePhotoButton");
    if (!saveButton) return;
    const saveDrawing = () => {
      p5.saveCanvas("FSD", "png");
    };
    saveButton.mousePressed(saveDrawing);
  };
  p5.updateWithProps = (props) => {
    if (props.ditheringOn !== void 0) {
      ditheringOn = props.ditheringOn;
    }
    if (props.onFPSChange !== void 0) {
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
        const brightness = getBrightness$1(x, y, p5);
        const quantized = brightness > 127 ? 255 : 0;
        const error = brightness - quantized;
        setBrightness$1(x, y, p5, quantized);
        if (x + 1 < video.width) {
          const brightnessRight = getBrightness$1(x + 1, y, p5);
          const newBrightnessRight = newPixelValue(brightnessRight, error * 7 / 16);
          setBrightness$1(x + 1, y, p5, newBrightnessRight);
        }
        if (x - 1 >= 0 && y + 1 < video.height) {
          const brightnessBottomLeft = getBrightness$1(x - 1, y + 1, p5);
          const newBrightnessBottomLeft = newPixelValue(brightnessBottomLeft, error * 3 / 16);
          setBrightness$1(x - 1, y + 1, p5, newBrightnessBottomLeft);
        }
        if (y + 1 < video.height) {
          const brightnessBottom = getBrightness$1(x, y + 1, p5);
          const newBrightnessBottom = newPixelValue(brightnessBottom, error * 5 / 16);
          setBrightness$1(x, y + 1, p5, newBrightnessBottom);
        }
        if (x + 1 < video.width && y + 1 < video.height) {
          const brightnessBottomRight = getBrightness$1(x + 1, y + 1, p5);
          const newBrightnessBottomRight = newPixelValue(brightnessBottomRight, error * 1 / 16);
          setBrightness$1(x + 1, y + 1, p5, newBrightnessBottomRight);
        }
      }
    }
    p5.updatePixels();
  };
};
const FloydSteinberg = UNSAFE_withComponentProps(function FloydSteinberg2() {
  const [ditheringOn, setDitheringOn] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  const fpsRef = useRef(null);
  const handleFPS = (fps) => {
    if (fpsRef.current) fpsRef.current.textContent = ` FPS: ${fps.toFixed(2)}`;
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col h-dvh items-center justify-center font-[Typewriter]",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col h-full items-center justify-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-2xl mb-5",
        children: "Floyd-Steinberg Dithering"
      }), /* @__PURE__ */ jsx("div", {
        hidden: !showFPS,
        ref: fpsRef,
        className: "text-black bg-white p-1 rounded text-2xl mb-5 font-mono",
        children: "FPS: 0.00"
      }), /* @__PURE__ */ jsx(P5Canvas, {
        sketch: sketch$1,
        ditheringOn,
        onFPSChange: handleFPS
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex w-full text-white p-3 bg-stone-900 h-full items-center justify-around flex-1",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex w-full justify-around flex-1 items-center md:flex-row flex-col",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "flex items-center",
          children: /* @__PURE__ */ jsx("button", {
            className: "cursor-pointer text-black p-2 m-1 bg-white rounded-md hover:bg-gray-200",
            children: "Back to Home"
          })
        }), /* @__PURE__ */ jsx("button", {
          id: "savePhotoButton",
          className: "cursor-pointer text-black p-2 m-1 bg-white rounded-md hover:bg-gray-200",
          children: "Save Photo"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "w-full flex-1 flex justify-around items-center  md:flex-row flex-col",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("input", {
            className: "mr-3",
            id: "ditheringToggle",
            type: "checkbox",
            checked: ditheringOn,
            onChange: () => setDitheringOn(!ditheringOn)
          }), /* @__PURE__ */ jsx("label", {
            htmlFor: "ditheringToggle",
            children: "Toggle Dithering"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("input", {
            className: "mr-3",
            id: "fpsToggle",
            type: "checkbox",
            checked: showFPS,
            onChange: () => setShowFPS(!showFPS)
          }), /* @__PURE__ */ jsx("label", {
            htmlFor: "fpsToggle",
            children: "Show FPS"
          })]
        })]
      })]
    })]
  });
});
const route2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: FloydSteinberg
}, Symbol.toStringTag, { value: "Module" }));
const getBrightness = (x, y, p5) => {
  const index = (x + y * p5.width) * 4;
  const r = p5.pixels[index];
  const g = p5.pixels[index + 1];
  const b = p5.pixels[index + 2];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const setBrightness = (x, y, p5, value) => {
  const index = (x + y * p5.width) * 4;
  p5.pixels[index] = value;
  p5.pixels[index + 1] = value;
  p5.pixels[index + 2] = value;
};
const sketch = (p5) => {
  let ditheringOn = false;
  let bayerSize = 0;
  let video;
  let onFPSChange = void 0;
  const WIDTH = window.screen.width > window.screen.height ? 320 : 240;
  const HEIGHT = window.screen.width > window.screen.height ? 240 : 320;
  let bayerMatrix = [[]];
  p5.setup = () => {
    p5.createCanvas(WIDTH, HEIGHT, p5.P2D);
    p5.frameRate(60);
    p5.pixelDensity(1);
    video = p5.createCapture(p5.VIDEO);
    video.size(WIDTH, HEIGHT);
    video.hide();
    const saveButton = p5.select("#savePhotoButton");
    if (!saveButton) return;
    const saveDrawing = () => {
      p5.saveCanvas("FSD", "png");
    };
    saveButton.mousePressed(saveDrawing);
  };
  p5.updateWithProps = (props) => {
    if (props.ditheringOn !== void 0) {
      ditheringOn = props.ditheringOn;
    }
    if (props.onFPSChange !== void 0) {
      onFPSChange = props.onFPSChange;
    }
    if (props.bayerSize !== void 0) {
      bayerSize = props.bayerSize;
      if (bayerSize == 2) {
        bayerMatrix = [[0, 2], [3, 1]];
      } else if (bayerSize == 4) {
        bayerMatrix = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
      } else if (bayerSize == 8) {
        bayerMatrix = [[0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26], [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22], [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25], [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]];
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
const BayerOrdered = UNSAFE_withComponentProps(function BayerOrdered2() {
  const [ditheringOn, setDitheringOn] = useState(false);
  const [showFPS, setShowFPS] = useState(true);
  const [bayerSize, setBayerSize] = useState(2);
  const fpsRef = useRef(null);
  const handleFPS = (fps) => {
    if (fpsRef.current) fpsRef.current.textContent = ` FPS: ${fps.toFixed(2)}`;
  };
  return /* @__PURE__ */ jsxs("div", {
    className: "flex flex-col h-dvh items-center justify-center font-[Typewriter]",
    children: [/* @__PURE__ */ jsxs("div", {
      className: "flex flex-col h-full items-center justify-center",
      children: [/* @__PURE__ */ jsx("h1", {
        className: "text-2xl mb-5",
        children: "Bayer Ordered Dithering"
      }), /* @__PURE__ */ jsx("div", {
        hidden: !showFPS,
        ref: fpsRef,
        className: "text-black bg-white p-1 rounded text-2xl mb-5 font-mono",
        children: "FPS: 0.00"
      }), /* @__PURE__ */ jsx(P5Canvas, {
        sketch,
        ditheringOn,
        bayerSize,
        onFPSChange: handleFPS
      })]
    }), /* @__PURE__ */ jsxs("div", {
      className: "flex w-full text-white p-3 bg-stone-900 h-full items-center justify-around flex-1",
      children: [/* @__PURE__ */ jsxs("div", {
        className: "flex w-full justify-around flex-1 items-center md:flex-row flex-col",
        children: [/* @__PURE__ */ jsx(Link, {
          to: "/",
          className: "flex items-center",
          children: /* @__PURE__ */ jsx("button", {
            className: "cursor-pointer text-black p-2 m-1 bg-white rounded-md hover:bg-gray-200",
            children: "Back to Home"
          })
        }), /* @__PURE__ */ jsx("button", {
          id: "savePhotoButton",
          className: "cursor-pointer text-black p-2 m-1 bg-white rounded-md hover:bg-gray-200",
          children: "Save Photo"
        })]
      }), /* @__PURE__ */ jsxs("div", {
        className: "w-full flex-1 flex justify-around items-center  md:flex-row flex-col",
        children: [/* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("input", {
            className: "mr-3",
            id: "ditheringToggle",
            type: "checkbox",
            checked: ditheringOn,
            onChange: () => setDitheringOn(!ditheringOn)
          }), /* @__PURE__ */ jsx("label", {
            htmlFor: "ditheringToggle",
            children: "Toggle Dithering"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("input", {
            className: "mr-3",
            id: "fpsToggle",
            type: "checkbox",
            checked: showFPS,
            onChange: () => setShowFPS(!showFPS)
          }), /* @__PURE__ */ jsx("label", {
            htmlFor: "fpsToggle",
            children: "Show FPS"
          })]
        }), /* @__PURE__ */ jsxs("div", {
          children: [/* @__PURE__ */ jsx("label", {
            children: "Bayer Matrix Size:"
          }), /* @__PURE__ */ jsxs("div", {
            className: "flex flex-col",
            children: [/* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("input", {
                className: "mr-3",
                name: "bayerSize",
                type: "radio",
                checked: bayerSize == 2,
                onChange: () => setBayerSize(2)
              }), "2"]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("input", {
                className: "mr-3",
                name: "bayerSize",
                type: "radio",
                checked: bayerSize == 4,
                onChange: () => setBayerSize(4)
              }), "4"]
            }), /* @__PURE__ */ jsxs("div", {
              children: [/* @__PURE__ */ jsx("input", {
                className: "mr-3",
                name: "bayerSize",
                type: "radio",
                checked: bayerSize == 8,
                onChange: () => setBayerSize(8)
              }), "8"]
            })]
          })]
        })]
      })]
    })]
  });
});
const route3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: BayerOrdered
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-gANhceH1.js", "imports": ["/assets/chunk-WWGJGFF6-CLcwhb55.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-DRSM5G-p.js", "imports": ["/assets/chunk-WWGJGFF6-CLcwhb55.js"], "css": ["/assets/root-COymCA7h.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-DXjpuDL2.js", "imports": ["/assets/chunk-WWGJGFF6-CLcwhb55.js"], "css": ["/assets/home-D7XikM17.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "dithering/FloydSteinberg": { "id": "dithering/FloydSteinberg", "parentId": "root", "path": "FloydSteinberg", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/FloydSteinberg-Dz88eXiH.js", "imports": ["/assets/chunk-WWGJGFF6-CLcwhb55.js", "/assets/main.es-_h-BPY0W.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "dithering/BayerOrdered": { "id": "dithering/BayerOrdered", "parentId": "root", "path": "BayerOrdered", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/BayerOrdered-hAS7eE8L.js", "imports": ["/assets/chunk-WWGJGFF6-CLcwhb55.js", "/assets/main.es-_h-BPY0W.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-1b6bc1e9.js", "version": "1b6bc1e9", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_optimizeDeps": false, "unstable_subResourceIntegrity": false, "v8_middleware": false, "v8_splitRouteModules": false, "v8_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  },
  "dithering/FloydSteinberg": {
    id: "dithering/FloydSteinberg",
    parentId: "root",
    path: "FloydSteinberg",
    index: void 0,
    caseSensitive: void 0,
    module: route2
  },
  "dithering/BayerOrdered": {
    id: "dithering/BayerOrdered",
    parentId: "root",
    path: "BayerOrdered",
    index: void 0,
    caseSensitive: void 0,
    module: route3
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
