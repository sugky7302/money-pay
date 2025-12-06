/**
 * vite-env.d.ts - Vite 環境變數型別定義
 *
 * 功能說明：
 * 1. 定義 VITE_GOOGLE_CLIENT_ID 環境變數型別
 * 2. 提供 TypeScript 型別提示
 */

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_AUTO_SYNC_DELAY: string;
  readonly VITE_MIN_SYNC_INTERVAL: string;
  readonly VITE_CHANGELOG_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
