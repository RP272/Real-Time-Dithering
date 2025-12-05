import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("FloydSteinberg", "dithering/FloydSteinberg.tsx"),
    route("BayerOrdered", "dithering/BayerOrdered.tsx"),
] satisfies RouteConfig;
