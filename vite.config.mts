import { URL, fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';
import { codecovVitePlugin } from "@codecov/vite-plugin";

import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const { getAbsoluteFSPath } = await import('swagger-ui-dist');
const swaggerUiPath = getAbsoluteFSPath();

// eslint-disable-next-line prefer-const
const config = defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: [
            `${normalizePath(swaggerUiPath)}/*.{js,css,html,png}`,
            `!${normalizePath(swaggerUiPath)}/**/index.html`,
            normalizePath(fileURLToPath(new URL('./dist/axios.min.js', import.meta.resolve('axios/package.json')))),
            normalizePath(fileURLToPath(new URL('./src/main/webapp/swagger-ui/index.html', import.meta.url))),
          ],
          dest: 'swagger-ui',
        },
      ],
    }),
    // Put the Codecov vite plugin after all other plugins
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: "app",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
  root: fileURLToPath(new URL('./src/main/webapp/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./build/resources/main/static/public', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./build/.vite-cache', import.meta.url)),
  build: {
    emptyOutDir: true,
    outDir: fileURLToPath(new URL('./build/resources/main/static/', import.meta.url)),
    rollupOptions: {
      input: {
        app: fileURLToPath(new URL('./src/main/webapp/index.html', import.meta.url)),
      },
    },
  },
  resolve: {
    alias: {
      vue: '@vue/compat/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src/main/webapp/app/', import.meta.url)),
    },
  },
  define: {
    I18N_HASH: '"generated_hash"',
    SERVER_API_URL: '"/"',
    APP_VERSION: `"${process.env.APP_VERSION ? process.env.APP_VERSION : 'DEV'}"`,
  },
  server: {
    host: true,
    port: 9000,
    proxy: Object.fromEntries(
      ['/api', '/management', '/v3/api-docs'].map(res => [
        res,
        {
          target: 'http://localhost:8080',
        },
      ]),
    ),
  },
});

// jhipster-needle-add-vite-config - JHipster will add custom config

export default config;