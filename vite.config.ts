/// <reference types="vitest" />

import {resolve} from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
	build: {
		sourcemap: true,
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'ACGraphCore',
			fileName: 'ac-graph-core-js',
		},
		rollupOptions: {
			output: {},
		},
	},
	plugins: [dts()],
	test: {},
});
