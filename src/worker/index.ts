import { Hono } from "hono";
import configRoute from "./routes/config";

const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.route("/api/config", configRoute);

export default app;
