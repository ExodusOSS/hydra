import commonjs from 'vite-plugin-commonjs'
import { flowPlugin, esbuildFlowPlugin } from '@bunchtogether/vite-plugin-flow'
import react from '@vitejs/plugin-react'
import { defineConfig, transformWithEsbuild } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import tsconfigPaths from 'vite-tsconfig-paths'

const port = 8008
const strictPort = true

// See: https://vitejs.dev/config.
export default defineConfig(() => ({
  build: {
    sourcemap: true,
  },
  optimizeDeps: {
    force: true,
    esbuildOptions: {
      plugins: [
        esbuildFlowPlugin(undefined, () => 'jsx', {
          all: true,
          pretty: false,
          ignoreUninitializedFields: false,
        }),
      ],
    },
  },
  plugins: [
    tsconfigPaths({ root: __dirname }),
    commonjs(),
    nodePolyfills(),
    flowPlugin({
      include: /\.(flow|jsx?)$/u,
      flow: {
        all: true,
        pretty: false,
        ignoreUninitializedFields: false,
      },
    }),
    {
      name: 'treat-js-files-as-jsx',
      async transform(code, id) {
        if (!id.endsWith('.js')) return null

        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        })
      },
    },
    react(),
  ],
  server: {
    port,
    strictPort,
  },
  preview: {
    port,
    strictPort,
  },
  define: {
    __USE_DEFAULT_SEED__: process.env.USE_DEFAULT_SEED ?? true,
  },
}))
