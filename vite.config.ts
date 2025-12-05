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
	server: {
		headers: {
			// Allow Google Sign-In popup to communicate with the main window
			"Cross-Origin-Opener-Policy": "same-origin-allow-popups",
		},
	},
});
