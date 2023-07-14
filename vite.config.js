import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [vue()],
	base: "/chart",
	server: {
		port: 1217,
		host: "0.0.0.0",
		open: true,
	},
	build: {
		target: 'esnext',
		reportCompressedSize: false,
		rollupOptions: {
			output: {
				paths: {
					vue: "https://unpkg.com/vue@3/dist/vue.global.js",
					echarts: "https://unpkg.com/browse/echarts@5.4.2/dist/echarts.min.js",
					"lodash/cloneDeep": "https://unpkg.com/browse/lodash@4.17.21/cloneDeep.js",
				},
			},
			external: ["vue", "echarts", "lodash/cloneDeep"],
		},
	},
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
})
