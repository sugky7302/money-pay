/**
 * Worker index.ts - Cloudflare Worker 入口點
 *
 * 功能說明：
 * 1. 設定 CORS 中介軟體
 * 2. 設定安全標頭（Cross-Origin-Opener-Policy）
 * 3. 路由 /api/config 提供前端設定
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import configRoute from "./routes/config";

const app = new Hono<{ Bindings: Env }>();

// CORS and security headers middleware
app.use("*", cors());
app.use("*", async (c, next) => {
  await next();
  // Allow Google Sign-In popup to communicate with the main window
  c.header("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  c.header("Cross-Origin-Embedder-Policy", "unsafe-none");
});

app.get("/api/", (c) => c.json({ name: "Cloudflare" }));

app.route("/api/config", configRoute);

export default app;
