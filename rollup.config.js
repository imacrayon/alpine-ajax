import babel from 'rollup-plugin-babel'
import filesize from 'rollup-plugin-filesize'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const config = {
  input: 'builds/cdn.js',
  output: [
    {
      name: 'AlpineAJAX',
      file: 'dist/cdn.js',
      format: 'umd',
    }
  ],
  plugins: [
    resolve(),
    filesize(),
    babel({
      babelrc: false,
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    }),
  ]
}

if (process.env.NODE_ENV === 'production') {
  config.plugins.push(terser())
}

export default config
