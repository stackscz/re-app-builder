# `re-app-builder`

Preconfigured `webpack` packaged as library. 
Instead of cloning some "boilerplate project", install this as dev dependency and easily start
your frontend project. 

## Usage

Install `re-app-builder` into your project or start in an empty directory!


    $ yarn add --dev re-app-builder


Add `re-app-builder` script to your `package.json`


    // package.json
    {
        "scripts": {
            "re-app-builder": "node ./node_modules/re-app-builder/bin"
        }
    }


Extend your .babelrc like this, create it if you don't have one already.


    // .babelrc
    {
        "extends": "re-app-builder/configs/.babelrc"
    }


Create your `webpack.config.js`.

    
    // webpack.config.js
    // This config is webpack-compatible
    // and overrides the defaults provided by re-app-builder
    module.exports = function () {
    	return {
    		entry: { // webpack compatible entry section
    			app: [
    				'./src'
    			]
    		},
    		excludedModules: [ // you can exclude modules from vendor bundle to avoid conflicts
    			'koa',
    			'koa-ejs'
    		],
    	}
    };

With the configuration above, `./src/index.js` will be used as an entry point of your app
and `./public/build/app.js` will be generated as an output. 

Start development server by running the script you added earlier with `dev` command


    $ npm run re-app-builder dev


Profit. Whenever you change source code, the app is automatically reloaded. 
The app is served at [127.0.0.1:8080](127.0.0.1:8080) in default html template


    <!DOCTYPE html>
    <html>
        <head>
            ... snip ...
        </head>
        <body>
            <div id="root"></div> <!-- for example mount your react app here -->
            ... snip ...
        </body>
    </html>

 
Or you can just use generated bundle in your own template:

    http://127.0.0.1:8080/build/app.js
    
that file is not actually created on disk and is only served from memory by webpack. 
To generate static production build, do

    $ npm run re-app-builder build

it will create minified static files `./public/build/app.js` and `./public/build/app.css`

Whenever you need the static build but non-minified, set `NODE_ENV=development`

    $ NODE_ENV=development npm run re-app-builder build

See [example project](./example-project) to discover all supported
 syntaxes.
