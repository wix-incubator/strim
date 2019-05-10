let webpack = require('webpack')
let path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const VirtualModulePlugin = require('virtual-module-webpack-plugin')

const STRIM_CLIENT_BUNDLE_FILE_PATH = './client.bundle.js'
const STRIM_WEBWORKER_BUNDLE_FILE_PATH = './webworker.bundle.js'

const ENVIRONMENT = {
  CLIENT: 'CLIENT',
  WEBWORKER: 'WEBWORKER',
}

function getClientConfig(content, outDir, environment) {
  let filename
  if (ENVIRONMENT.CLIENT === environment) {
    filename = STRIM_CLIENT_BUNDLE_FILE_PATH
  } else if (ENVIRONMENT.WEBWORKER === environment) {
    filename = STRIM_WEBWORKER_BUNDLE_FILE_PATH
  }

  return {
    entry: './clientBundle.js',
    target: 'web',
    output: {
      path: outDir,
      filename,
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
      new CleanWebpackPlugin({
        cleanOnceBeforeBuildPatterns: [filename],
      }),
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
  STRIM_WEBWORKER_BUNDLE_FILE_PATH,
  ENVIRONMENT,
}
