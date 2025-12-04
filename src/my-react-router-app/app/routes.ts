import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("canvas", "canvas/boilerplate.tsx"),

] satisfies RouteConfig;
