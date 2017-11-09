A step by step guide on how to set up your react app from scratch.

All the configuration files are of course customizable, code examples provided in this guide are just suggestions, if you feel like optimizing the configurations for your needs, feel free to do so.

This guide uses yarn (an alternative for npm) if you don't have it installed, be sure to do so. You can thank us later... ( https://yarnpkg.com/en/ )

(code examples starting with `$` are bash commands)

___

1) Create an empty directory
2) Install re-app-builder into it

```
$ yarn add --dev https://github.com/stackscz/re-app-builder#4f8b9c1423b96154844528681c20fe3ee579741d
```

3) Add scripts to your `package.json`

```
// package.json

{
    // ...

    "scripts": {
        "ab": "node ./node_modules/re-app-builder",
        "clean": "rm -rf ./public && rm -rf ./manifest",
        "dev":
        "yarn run clean && export $(cat .env.devserver | xargs) && NODE_ENV=development yarn run ab dev",
        "build:dev": "yarn run clean && NODE_ENV=development yarn run ab build",
        "build": "yarn run clean && yarn run ab build",
        "lint": "eslint ./src",
        "prepush": "yarn run lint"
    }
}
```

(All of these scripts are not necessary for running the dev server, but will be useful throughout the development, if you're not familiar with them, get so.)

4) Create `.babelrc` file with this content in the project's root directory

```
{
  "extends": "./node_modules/re-app-builder/base-babel-config.json",
  "plugins": [
    [
      "module-resolver",
      {
        "root": ["."],
        "alias": {
          "mocks": "./mocks",
          "i18n": "./src/i18n",
          "components": "./src/components",
          "examples": "./src/examples",
          "decorators": "./src/decorators",
          "forms": "./src/forms",
          "form-controls": "./src/form-controls",
          "form-fields": "./src/form-fields",
          "fonts": "./src/fonts",
          "modals": "./src/modals",
          "modules": "./src/modules",
          "screens": "./src/screens",
          "stylesheets": "./src/stylesheets",
          "utils": "./src/utils",
          "spec": "./spec",
          "routesNames": "./src/routesNames.js",
          "data": "./src/data",
          "constants": "./src/constants",
          "fragments": "./src/fragments",
          "queries": "./src/queries",
          "mutations": "./src/mutations"
        }
      }
    ]
  ]
}
```

5) Create `re-app-builder.config.js` file with this content in the project's root directory

```
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

```

With the configuration above, `./src/index.js` will be used as an entry point of your app.

6) In the project's root directory Create `src` folder and `index.js` file in it with this content 

```
import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(<h1> Hello World </h1>, document.getElementById('root'))
```

7) Create `index.html` in the `./src` directory with this content

```
<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />

  <title> re-app-builder project </title>
  <meta property="og:title" content="" />
  <meta property="og:type" content="website" />

  <meta name="theme-color" content="#ffffff">

  <script>
    // Example 
    // window.API_SPEC_URL = '<%= '{*API_SPEC_URL *}' %>';
  </script>
</head>

<body>
  <div id="root"></div>

</body>

</html>
```

8) Install dependencies

```
$ yarn add react react-dom
```

9) Install dev-dependencies

```
$ yarn add --dev add-asset-html-webpack-plugin babel-plugin-module-resolver html-webpack-include-assets-plugin
```

10) create empty file called htmlStub.js in ./src directory

11) Create `.env.devserver` in the root directory of this project with this content

```
API_SPEC_URL=http://www.example.example
DEV_PORT=8080
```

12) Your app is all set. You can now open it using 

```
$ yarn run dev
```

and in your browser view on this address `http://localhost:8080/`

You can now continue by replacing the "Hello World" in ./src/index.js by your first react component.

If you followed all the 12 steps and still have errors, compare your project with `example-project` and look for differences.

