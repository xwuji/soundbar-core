import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import alias from '@rollup/plugin-alias'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
const path = require('path')

export default {
  input: 'src/index.js',
  output: {
    file: 'build/bundle.js',
    format: 'umd',
    name: 'soundbarCore'
  },
  plugins: [
    commonjs(),
    resolve(),
    terser(),
    babel({ babelHelpers: 'bundled' }),
    alias({
      entries: [
        { find: '@core', replacement: path.resolve(__dirname, 'src/core') },
        { find: '@lib', replacement: path.resolve(__dirname, 'src/lib') },
        { find: '@config', replacement: path.resolve(__dirname, 'src/config') }
      ]
    })
  ]
}
