import { Hono } from "hono";
const app = new Hono<{ Bindings: Env }>();

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.route("/api/config", await import("./routes/config").then((m) => m.default));

export default app;
