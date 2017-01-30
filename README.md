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
            "ab": "node ./node_modules/re-app-builder/bin"
        }
    }

3. Extend your .babelrc


    // .babelrc
    {
        "extends": "re-app-builder/configs/.babelrc"
    }


4. Create your `webpack.config.js`

    
    // webpack.config.js
    module.exports = function () {
    	return {
    		entry: { // webpack compatible entry section
    			index: [
    				'./src'
    			]
    		},
    		excludedModules: [ // can exclude modules from vendor bundle to avoid conflicts
    			'koa',
    			'koa-ejs'
    		],
    	}
    };
    

5. `npm run dev`, [http://127.0.0.1:8080]()
