const path = require('path');

module.exports = {
  entry: {
    tasks: './webapp/src/tasks/main.js',
    worker: './webapp/src/worker/main.js',
    performance: './webapp/src/performance/main.js',
  },
  output: {
    path: path.resolve(__dirname, './webapp/www'),
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './webapp/www',
    port: 7000,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      vue$: 'vue/dist/vue.esm.js', // full build with compiler
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
