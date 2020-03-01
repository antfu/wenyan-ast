import path from 'path'
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'
import dts from 'rollup-plugin-dts'
import { uglify } from 'rollup-plugin-uglify'

const packages = [{
  name: 'compiler',
  dts: true,
  format: 'umd',
  umdName: 'WenyanCompiler',
  uglify: true,
}, {
  name: 'executor',
  dts: true,
  format: 'umd',
  umdName: 'WenyanExecutor',
  uglify: true,
}, {
  name: 'render',
  dts: true,
  uglify: true,
}, {
  name: 'cli',
  format: 'cjs',
  external: [
    'commander',
    'fs-extra',
    'find-up',
    'fast-glob',
    'chalk',
  ],
}]

const configs = []

packages.forEach((pkg) => {
  configs.push({
    input: `./packages/${pkg.name}/src/index.ts`,
    output: {
      file: `./packages/${pkg.name}/dist/index.js`,
      format: pkg.format || 'cjs',
      name: pkg.umdName,
    },
    plugins: [
      typescript({
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
        tsconfigOverride: {
          declaration: false,
          declarationDir: null,
          declarationMap: false,
        },
      }),
      json(),
      pkg.uglify ? uglify() : undefined,
    ].filter(i => i),
    external: pkg.external || [],
  })

  if (pkg.dts) {
    configs.push({
      input: `./typings/${pkg.name}/src/index.d.ts`,
      output: {
        file: `./packages/${pkg.name}/dist/index.d.ts`,
        format: 'es',
      },
      plugins: [
        dts(),
      ],
    })
  }
})

export default configs
