#!/usr/bin/env node
/* eslint @typescript-eslint/no-var-requires: 0 */
const path = require('path')

const isProdBuild =
  process.argv.includes('--prod') || !process.argv.includes('--watch')

const dynamicPublicPathPlugin = {
  name: 'prefix-path',
  setup(build) {
    build.onResolve({ filter: /\.(png|webp)$/ }, (args) => {
      const needsPrefix =
        args.kind === 'import-statement' && args.pluginData !== 'dynamic'
      return {
        path: path.resolve(args.resolveDir, args.path),
        namespace: needsPrefix ? 'prefix-path' : 'file',
      }
    })

    build.onLoad({ filter: /\.*/, namespace: 'prefix-path' }, async (args) => {
      return {
        pluginData: 'dynamic',
        contents: `
          import p from ${JSON.stringify(args.path)}
          const prefixPath = pathPrefix + "/static/" + p
          export default prefixPath
        `,
        loader: 'js',
      }
    })
  },
}

require('esbuild')
  .build({
    entryPoints: { explore: 'explore/explore.tsx', app: 'app/index.tsx' },
    outdir: 'build/static/',
    logLevel: 'info',
    bundle: true,
    define: {
      'process.env.NODE_ENV': isProdBuild ? '"production"' : '"dev"',
      global: 'window',
    },
    minify: isProdBuild,
    sourcemap: 'linked',
    plugins: [dynamicPublicPathPlugin],
    target: ['chrome80', 'firefox99', 'safari12', 'edge79'],
    banner: {
      js: `var GOALERT_VERSION=${JSON.stringify(process.env.GOALERT_VERSION)};\nvar LOGOUT_URL=${JSON.stringify(process.env.LOGOUT_URL)};`,
    },
    loader: {
      '.png': 'file',
      '.webp': 'file',
      '.js': 'jsx',
      '.svg': 'dataurl',
      '.md': 'text',
    },
    watch: process.argv.includes('--watch'),
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
