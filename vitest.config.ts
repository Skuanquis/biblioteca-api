import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    env: {
      APP_PROFILE: 'prod',
      API_KEY: 'test-api-key',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
