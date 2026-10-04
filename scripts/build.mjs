import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));

await build({
  entryPoints: ['src/server.ts'],
  outfile: 'dist/biblioteca-api.cjs',
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'cjs',
  define: { __APP_VERSION__: JSON.stringify(version) },
});

console.log(`dist/biblioteca-api.cjs generado (v${version})`);
