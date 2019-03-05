let webpack = require('webpack')
let path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')

const clientConfig = {
  entry: './src/Strim/Strim.ts',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'strim.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory=true'],
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', 'tsx', '.json'],
  },
}

const serverConfig = {
  entry: './src/strimModules/strimModules.ts',
  target: 'node',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'strimModules.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader?cacheDirectory=true'],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', 'tsx', '.json'],
  },
  externals: {
    express: 'express',
  },
}

module.exports = [clientConfig, serverConfig]
