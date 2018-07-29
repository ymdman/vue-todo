const mode = process.env.NODE_ENV;

const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CleanEntryPlugin = require('clean-entry-webpack-plugin');
const postcssImport = require('postcss-import');
const postcssMixins = require('postcss-mixins');
const postcssSorting = require('postcss-sorting');
const postcssCssnext = require('postcss-cssnext');
const postcssExtend = require('postcss-extend');
const path = require('path')
const glob = require('glob')

const setEntries = fileType => {
  const entries = {};

  glob.sync(`./src/${fileType}/**/*.${fileType}`, {
    ignore: [
      './src/js/component/**/*.js',
      './src/pcss/**/_*.pcss',
    ]
  }).map(file => {
    const fileName = file.match(`.+/${fileType}/(.+?).${fileType}`)[1];
    entries[fileName] = file;

    return entries;
  });

  return entries;
};

module.exports = [{
    mode,

    entry: setEntries('js'),

    output: {
      path: path.join(__dirname, '/docs/js'),
      filename: '[name].js'
    },

    module: {
      rules: [{
          test: /\.vue$/,
          use: [{
            loader: "vue-loader",
          }]
        },

        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  'modules': false
                }]
              ]
            }
          },
        },

        {
          test: /\.css$/,
          use: [
            'vue-style-loader',
            'css-loader'
          ]
        }
      ],
    },

    resolve: {
      extensions: ['.js', '.vue'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
      }
    },

    plugins: [
      new VueLoaderPlugin(),
    ],
  },

  {
    mode: 'none',

    devtool: mode === 'development' ? 'inline-source-map' : 'none',

    entry: setEntries('pcss'),

    output: {
      path: path.join(__dirname, '/docs/css'),
    },

    module: {
      rules: [{
        test: /\.pcss$/,
        use: [
          MiniCssExtractPlugin.loader,

          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              minimize: mode === 'production',
              sourceMap: mode === 'development',
            }
          },

          {
            loader: 'postcss-loader',
            options: {
              parser: 'postcss-comment-2',
              sourceMap: mode === 'development',
              plugins: (loader) => [
                postcssImport({
                  root: loader.resourcePath
                }),
                postcssMixins(),
                postcssExtend(),
                postcssCssnext({
                  browsers: ['last 2 version']
                }),
                postcssSorting({
                  'properties-order': 'alphabetical',
                }),
              ]
            }
          }
        ],
      }]
    },

    plugins: [
      new MiniCssExtractPlugin({
        filename: '[name].css',
        chunkFilename: "[id].css",
      }),
      new CleanEntryPlugin(),
    ],
  }
];
