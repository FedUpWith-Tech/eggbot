import typescript from '@rollup/plugin-typescript';
import autoExternal from 'rollup-plugin-auto-external';

export default {
  input: 'src/app.ts',
  output: {
    sourcemap: true,
    dir: 'out',
    format: 'esm',
  },
  plugins: [typescript(), autoExternal()],
};
