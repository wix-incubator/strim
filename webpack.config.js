let webpack = require('webpack')
let path = require('path')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

const clientConfig = {
  entry: './src/Strim/Strim.ts',
  target: 'web',
  mode: 'production',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'strim.js',
    libraryTarget: 'umd',
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
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([
      'src/strimModules/strimModules.js',
      'src/strimModules/webpack.config.client.js',
    ]),
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', 'tsx', '.json'],
  },
}

// const serverConfig = {
//   entry: './src/strimModules/strimModules.ts',
//   target: 'node',
//   output: {
//     path: path.resolve(__dirname, './dist'),
//     filename: 'strimModules.js',
//     libraryTarget: 'umd',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(js|jsx|ts|tsx)$/,
//         exclude: /node_modules/,
//         use: ['babel-loader?cacheDirectory=true'],
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['.js', '.jsx', '.ts', 'tsx', '.json'],
//   },
//   externals: [nodeExternals()],
// }

// module.exports = [clientConfig, serverConfig]
module.exports = clientConfig
