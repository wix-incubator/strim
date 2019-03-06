let webpack = require('webpack')
let path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VirtualModulePlugin = require('virtual-module-webpack-plugin')

const STRIM_CLIENT_BUNDLE_FILE_PATH = './client.bundle.js'

function getClientConfig(content) {
  return {
    entry: './clientBundle.js',
    target: 'web',
    output: {
      path: path.resolve(__dirname, '../../dist/client'),
      filename: STRIM_CLIENT_BUNDLE_FILE_PATH,
    },
    mode: 'production',
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader?cacheDirectory=true'],
        },
      ],
    },
    plugins: [
      //new CleanWebpackPlugin(),
      new VirtualModulePlugin({
        moduleName: './clientBundle.js',
        contents: content,
      }),
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', 'tsx', '.json'],
    },
  }
}

module.exports = {
  getClientConfig,
  STRIM_CLIENT_BUNDLE_FILE_PATH,
}
