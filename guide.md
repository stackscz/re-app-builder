A step by step guide on how to set up your react app from scratch.

All the configuration files are of course customizable, code examples provided in this guide are just suggestions, if you feel like optimizing the configurations for your needs, feel free to do so.

This guide uses yarn (an alternative for npm) if you don't have it installed, be sure to do so. You can thank us later... ( https://yarnpkg.com/en/ )

(code examples starting with `$` are bash commands)
(this guide has content suggestions in it, if you are not sure what to exactly in created files, you can copy the suggestions)

___

1) Create an empty directory
2) Install re-app-builder into it

```
$ yarn add --dev https://github.com/stackscz/re-app-builder#4f8b9c1423b96154844528681c20fe3ee579741d
```

3) Add scripts to your `package.json`

Content suggestion:
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

4) Create `.babelrc` file in the project's root directory

Content suggestion:
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

5) Copy `re-app-builder.config.js` from `example-project` directory to the project's root directory

With this configuration `./src/index.js` will be used as an entry point of your app.

6) In the project's root directory Create `src` folder and `index.js` file.

Content suggestion:
```
import React from 'react'
import ReactDOM from 'react-dom'

ReactDOM.render(<h1> Hello World </h1>, document.getElementById('root'))
```

7) Create `index.html` in the `./src` directory

Content suggestion:
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

we install these dependecies, because we are using them as suggestion in step 6.

9) Install dev-dependencies

```
$ yarn add --dev add-asset-html-webpack-plugin babel-plugin-module-resolver html-webpack-include-assets-plugin
```

Useful dev-dependecies

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

and in your browser view it on this address `http://localhost:8080/`

You can now continue by replacing the "Hello World" in ./src/index.js by your first react component.

If you followed all the 12 steps and still have errors, compare your project with `example-project` and look for differences.

