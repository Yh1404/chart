import { fileURLToPath, URL } from "node:url"
import { visualizer } from "rollup-plugin-visualizer"
import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import { splitVendorChunkPlugin } from "vite"
import viteCompression from "vite-plugin-compression"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		splitVendorChunkPlugin(),
		viteCompression({
			deleteOriginFile: true,
		}),
		// visualizer({
		// 	filename: "report.html",
		// 	open: true,
		// 	gzipSize: true
		// }),
	],
	server: {
		port: 1217,
		host: "0.0.0.0",
		open: true,
	},
	build: {
		assetsDir: '/chart',
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				format: "esm",
				paths: {
					echarts: "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.2/echarts.esm.min.js",
				},
			},
			external: ["echarts"],
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
})
