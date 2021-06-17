const path = require('path');

const { DefinePlugin } = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env, { mode = 'development' } = {}) {
  const isDev = mode === 'development';

  return {
    mode,
    stats: { children: false },
    entry: './src/index.js',
    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/',
      pathinfo: false
    },
    devServer: {
      compress: true,
      port: 9973,
      client: {
        logging: 'warn'
      }
    },
    devtool: isDev ? 'eval-source-map' : false,
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          exclude: /node_modules/
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
              options: {
                esModule: false
              }
            },
            'css-loader'
          ]
        },
        {
          test: /\.(png|webp|svg|gif|woff2)$/,
          loader: 'file-loader',
          options: {
            publicPath: 'assets/',
            name: '[name].[ext]',
            emitFile: false,
            esModule: false
          }
        }
      ]
    },
    plugins: [
      new DefinePlugin({
        DEV_MODE: JSON.stringify(isDev),
        __VUE_OPTIONS_API__: false,
        __VUE_PROD_DEVTOOLS__: false
      }),
      new VueLoaderPlugin(),
      new MiniCssExtractPlugin({ filename: '[name].css' }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'index.html', to: 'index.html' },
          { from: 'src/assets', to: 'assets' }
        ]
      })
    ],
    resolve: {
      extensions: ['.js'],
      symlinks: false
    }
  };
};
