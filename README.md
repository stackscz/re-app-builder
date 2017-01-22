# `re-app-builder`

Enables your `react` ES6 web project to be built with `webpack` out of the box with most common configuration. Supports ES6 syntax transpilation, require/import statements, less and sass compilation, image modules etc. 

## Installation

1. `cd` into your clean project directory and run


    npm init
    yarn add --dev re-app-builder


2. Add `re-app-builder` script section entry to your `package.json`


    // example package.json
    {
        "scripts": {
            "ab": "node ./node_modules/re-app-builder"
        }
    }

3. Extend your .babelrc


    {
        "extends": "./node_modules/re-app-builder/configs/.babelrc",
    }


4. `npm run dev`, [http://127.0.0.1:8080]()

## Usage

### Project structure

- `src` folder holds all your project source files, `re-app-builder` looks for `index.js` as entry point
- `examples` folder holds all your project examples source files (optional)
- `public` folder contains static assets served by webpack-dev-server, namely `index.html` of your app (optional)
- `lib` folder is automatically created during build, it's content is also served by webpack-dev-server so there might be conflicts with files `public` folder if you let that to happen 

Here is friendly `index.html` 7-liner

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
    <script src="/index.js"></script>
    </body>
    </html>

### Building project

Add following script section entry to your package.json

    ...
    "ab": "node ./node_modules/re-app-builder"
    ...

so you can run following commands 

    npm run ab dev [app_name] # starts dev server at 127.0.0.1:8080
    npm run ab build:dev [app_name] # builds app in dev mode
    npm run ab build:dev:watch [app_name] # builds app in dev mode and watches for changes
    npm run ab build:prod [app_name] # builds app in production mode

To enable linting create `.eslintrc`:

    {
      "extends": "./re-app-builder/react/.eslintrc"
    }
