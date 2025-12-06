/**
 * main.tsx - 應用程式入口點
 *
 * 功能說明：
 * 1. 建立 React 根組件
 * 2. 渲染 App 組件到 DOM
 * 3. 啟用 StrictMode 進行開發檢查
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
