/**
 * useConfig - 從 Vite 環境變數取得設定，若無則 fallback 到 Worker API
 */
import { useEffect, useState } from "react";

type Config = {
    googleClientId: string;
};

// 從 Vite 環境變數取得初始值
const viteConfig: Config = {
    googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
};

// 檢查是否所有必要的設定都已從 Vite 取得
function isConfigComplete(config: Config): boolean {
    return Boolean(config.googleClientId);
}

// 全域快取
let configCache: Config | null = isConfigComplete(viteConfig) ? viteConfig : null;
let configPromise: Promise<Config> | null = null;

async function fetchConfigFromWorker(): Promise<Config> {
    // 如果 Vite 環境變數已經完整，直接回傳
    if (configCache) return configCache;
    
    // 避免重複請求
    if (!configPromise) {
        configPromise = fetch("/api/config")
            .then((res) => res.json())
            .then((data: Config) => {
                // 合併：Vite 環境變數優先，Worker 補充
                configCache = {
                    googleClientId: viteConfig.googleClientId || data.googleClientId,
                };
                return configCache;
            });
    }
    
    return configPromise;
}

/**
 * Hook: 取得前端設定
 * 優先使用 Vite 環境變數，若無則從 Worker API 取得
 */
export function useConfig() {
    const [config, setConfig] = useState<Config | null>(configCache);
    const [loading, setLoading] = useState(!configCache);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // 如果快取已存在，直接使用
        if (configCache) {
            setConfig(configCache);
            setLoading(false);
            return;
        }

        // 從 Worker 取得設定
        fetchConfigFromWorker()
            .then(setConfig)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

    return { config, loading, error };
}

/**
 * 預先載入設定（可在 App 初始化時呼叫）
 * 如果 Vite 環境變數已完整，會立即 resolve
 */
export function prefetchConfig(): Promise<Config> {
    return fetchConfigFromWorker();
}
