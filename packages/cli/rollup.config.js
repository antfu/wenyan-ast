// rollup.config.js
import typescript from 'rollup-plugin-typescript2'
import json from '@rollup/plugin-json'

const external = [
  'commander',
  'fs-extra',
  'find-up',
  'fast-glob',
  'chalk',
]

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: './dist/index.js',
        format: 'cjs',
      },
    ],
    plugins: [
      typescript(),
      json(),
    ],
    external,
  },
]
