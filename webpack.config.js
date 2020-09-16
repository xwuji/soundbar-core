const path = require('path')
module.exports = {
  mode: 'development',
  entry: './example/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'soundbar',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      include: [path.resolve(__dirname, 'src')],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env']
        }
      }]
    }]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    alias: {
      '@core': path.resolve(__dirname, 'src/core'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@config': path.resolve(__dirname, 'src/config')
    }
  },
  target: 'node'
}
