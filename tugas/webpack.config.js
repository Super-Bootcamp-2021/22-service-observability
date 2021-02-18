const DotenvWebpackPlugin = require('dotenv-webpack');
const path = require('path');

module.exports = {
  entry: {
    performance: './webapp/src/performance/v-dom.ts',
    worker: './webapp/src/worker/v-dom.ts',
    tasks: './webapp/src/tasks/v-dom.ts',
  },
  output: {
    path: path.resolve(__dirname, 'webapp/www'),
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './webapp//www',
    port: 7000,
  },
  plugins: [
    new DotenvWebpackPlugin({
      path: './.env',
      safe: true,
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.css'],
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.yaml$/,
        use: [{ loader: 'json-loader' }, { loader: 'yaml-loader' }],
      },
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
