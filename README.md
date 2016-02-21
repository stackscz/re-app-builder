# `re-app-builder`

Enables your `react` ES6 web project to be built with `webpack` out of the box with most common configuration. Supports ES6 syntax transpilation, require/import statements, less and sass compilation, image modules etc. 

## Installation

`cd` into your clean project directory and run

    npm init
    npm i -S https://github.com/stackscz/re-app-builder

## Usage

### Project structure

- `src` folder holds all your project source files, `re-app-builder` looks for `index.js` as entry point
- `examples` folder holds all your project examples source files (optional)
- `public` folder contains static assets served by webpack-dev-server, namely `index.html` of your app (optional)
- `lib` folder is automatically created during build, it's content is also served by webpack-dev-server so there might be conflicts with files `public` folder if you let that to happen 

Additionally, `apps` folder can be created to host multiple experimental apps separately. 
Those should have same structure as described above. 
For example `apps/myapp/src` contains sources of `myapp`.

Here is `index.html` 7-liner

    <!DOCTYPE html>
    <html>
    <head></head>
    <body>
    <script src="/index.js"></script>
    </body>
    </html>

### Building project

Add following script to your package.json

    "ab": "node ./node_modules/@stackscz/webpack-configs/app-builder"    

so you can run following commands 

    npm run ab dev [app_name] # starts dev server at 127.0.0.1:8080
    npm run ab build:dev [app_name] # builds app in dev mode
    npm run ab build:dev:watch [app_name] # builds app in dev mode and watches for changes
    npm run ab build:prod [app_name] # builds app in production mode
