/// <reference types="vitest" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), 'VITE_');

	return {
		plugins: [react()],
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		server: {
			proxy: {
				'/api': {
					target: 'http://localhost:3000',
					changeOrigin: true,
				},
			},
		},
		test: {
			globals: true,
			environment: 'jsdom',
			setupFiles: ['./src/test/setup.ts'],
			include: ['src/**/*.{test,spec}.{ts,tsx}'],
			testTimeout: 30_000,
			env: {
				VITE_SUPABASE_URL: env.VITE_SUPABASE_URL || '',
				VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY || '',
			},

		},
	};
})
