import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { dts } from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import packageJson from './package.json' with { type: 'json' };

export default [
  // Build principal
  {
    input: 'src/lib/index.ts',
    output: [
      {
        file: packageJson.main,    // CommonJS
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: packageJson.module,  // ES Modules
        format: 'esm', 
        sourcemap: true,
      },
      {
        file: 'dist/index.umd.js', // UMD para browsers
        format: 'umd',
        name: 'XStateBuilders',     // Global variable name
        sourcemap: true,
        globals: {
          'xstate': 'XState',
          'react': 'React',
          '@xstate/react': 'XStateReact'
        },
      },
    ],
    plugins: [
      peerDepsExternal(),         // Excluye peerDependencies
      resolve({ 
        browser: true,
        preferBuiltins: false 
      }),
      commonjs({
        include: ['node_modules/**'],
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        exclude: ['**/*.test.*', '**/*.spec.*', 'examples/**', 'src/App.tsx', 'src/index.tsx', 'src/reportWebVitals.ts', 'src/setupTests.ts']
      }),
    ],
    external: ['xstate', '@xstate/react', 'react', 'react-dom'], // Peer dependencies
  },
  
  // Build de tipos TypeScript
  {
    input: 'dist/lib/index.d.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'esm',
    },
    plugins: [dts()],
    external: [/\.(css|less|scss|sass)$/],
  },
];