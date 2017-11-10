const path = require('path')
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')

module.exports = function(options) {
  const {
    mergeWithBaseConfig,
    mergeHtmlFeatureConfig,
    isDevServer,
    webpack,
    ForceNodeOutputFileSystemPlugin,
  } = options

  const vendor = Object.keys(require('./package.json').dependencies).filter(
    m => !['client-core', 'addressfield.json'].includes(m),
  )
  const manifestFilePath = path.resolve(__dirname, 'manifest/manifest.json')

  const output = {
    path: path.resolve(__dirname, 'public/build'),
    publicPath: '/build/',
  }

  const main = mergeWithBaseConfig({
    name: 'app',
    dependencies: isDevServer ? ['vendor'] : [],
    entry: {
      app: [
        ...(isDevServer
          ? [
              `webpack-dev-server/client?http://localhost:${process.env
                .DEV_PORT}/`,
            ]
          : []),
        './src',
      ],
    },
    output,
    resolve: {
      alias: {
        // Not necessary unless you consume a module using `createClass`
        // 'create-react-class': 'preact-compat/lib/create-react-class',
        queries: path.resolve(__dirname, 'src/queries'),
        fragments: path.resolve(__dirname, 'src/fragments'),
        mutations: path.resolve(__dirname, 'src/mutations'),
      },
    },
    module: {
      rules: [
        {
          test: /\.(graphql|gql)$/,
          exclude: /node_modules/,
          loader: 'graphql-tag/loader',
        },
      ],
    },
    plugins: [
      new webpack.EnvironmentPlugin(['API_SPEC_URL']),
      ...(isDevServer
        ? [
            new AddAssetHtmlPlugin([
              {
                filepath: path.resolve(
                  __dirname,
                  'public/build/vendor.bundle.js',
                ),
                includeSourcemap: false,
              },
            ]),
            new webpack.DllReferencePlugin({
              context: __dirname,
              manifest: manifestFilePath,
              name: 'vendor_lib',
            }),
          ]
        : []),
    ],
    devServer: {
      contentBase: './public/',
      publicPath: '/build/',
      historyApiFallback: {
        rewrites: [],
      },
    },
  })

  const html = mergeWithBaseConfig(
    mergeHtmlFeatureConfig({
      baseConfig: {
        name: 'html',
        dependencies: ['app'],
        entry: ['./src/htmlStub'],
        output,
        plugins: [
          new HtmlWebpackIncludeAssetsPlugin({
            assets: [
              ...(!isDevServer ? ['app.css'] : ['vendor.bundle.js']),
              'app.js',
            ],
            append: true,
            hash: true,
          }),
        ],
      },
      fileConfigs: [
        {
          filename: '../index.html',
          template: './src/index.html',
        },
      ],
    }),
  )

  return [
    ...(isDevServer
      ? [
          mergeWithBaseConfig({
            name: 'vendor',
            entry: {
              vendor,
            },
            output: {
              path: path.resolve(__dirname, 'public/build'),
              filename: 'vendor.bundle.js',
              library: 'vendor_lib',
              publicPath: '/build/',
            },
            resolve: {},
            plugins: [
              new ForceNodeOutputFileSystemPlugin(),
              new webpack.DllPlugin({
                context: __dirname,
                path: manifestFilePath,
                name: 'vendor_lib',
              }),
            ],
          }),
        ]
      : []),
    main,
    html,
  ]
}
