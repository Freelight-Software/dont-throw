import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  clean: true,
  dts: true,
  treeshake: true,
  outDir: 'dist',
  target: 'esnext',
  tsconfig: 'tsconfig.prod.json',
});
