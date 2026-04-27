import {defineConfig} from 'vitest/config';

export default defineConfig({
	plugins: [
		(function profiler() {
			return {
				name: 'profiler-helper',
				async config(config: any) {
					if (('' + process.env.VITEST_PROFILE).trim() !== '1') {
						return config;
					}

					return {
						...config,
						test: {
							...(config.test ?? {}),
							watch: false,
							pool: 'threads',
							execArgv: ['--cpu-prof', '--cpu-prof-dir=test-profiles'],
							maxWorkers: 1,
							fileParallelism: false,
						},
					};
				},
			};
		})(),
	],
});
