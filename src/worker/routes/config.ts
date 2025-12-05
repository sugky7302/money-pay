/**
 * Config API - 提供前端需要的設定值
 * 只暴露安全的、前端需要的環境變數
 */
import { Hono } from "hono";

const config = new Hono<{ Bindings: Env }>();

// GET /api/config - 取得前端設定
config.get("/", (c) => {
    return c.json({
        googleClientId: c.env.GOOGLE_CLIENT_ID,
    });
});

export default config;
