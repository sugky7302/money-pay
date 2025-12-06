import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react(), cloudflare(), tailwindcss()],
	resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					// 第三方庫分離
					'vendor-react': ['react', 'react-dom'],
					'vendor-oauth': ['@react-oauth/google'],
					'vendor-charts': ['recharts'],
					'vendor-scanner': ['@yudiel/react-qr-scanner'],
					'vendor-markdown': ['react-markdown'],
				},
			},
		},
	},
	server: {
		headers: {
			// Allow Google Sign-In popup to communicate with the main window
			"Cross-Origin-Opener-Policy": "same-origin-allow-popups",
		},
	},
});
