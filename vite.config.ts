// vite.config.ts
import { defineConfig } from 'vitest/config';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  test: {
    testTimeout: 10000,
    silent: true,
    coverage: {
      branches: 70,
      // lines: 50,
      // statements: 50,
      // functions: 50,
      include: ['lib/core', 'lib/utils'],
    },
  },
  plugins: [
    AutoImport({
      imports: ['vitest'],
      dts: true, // generate TypeScript declaration
    }),
  ],
});
