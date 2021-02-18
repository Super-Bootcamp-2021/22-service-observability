const path = require('path');

module.exports = {
  entry: {
    tasks: './webapp/src/tasks/v-dom.js',
    worker: './webapp/src/worker/v-dom.js',
    performance: './webapp/src/performance/v-dom.js',
  },
  output: {
    path: path.resolve(__dirname, 'webapp/www'),
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './webapp/www',
    port: 7000,
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
