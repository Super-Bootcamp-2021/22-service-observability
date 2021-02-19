const path = require('path');

module.exports = {
  entry: {
    tasks: './webapp/src/tasks/main.ts',
    worker: './webapp/src/worker/main.ts', // worker belum diubah ke ts
    performance: './webapp/src/performance/main.ts',
  },
  output: {
    path: path.resolve(__dirname, 'www'),
    filename: '[name].js',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './webapp//www',
    port: 7000,
  },
  resolve: {
    extensions: ['.js', '.ts'],
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
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
};
