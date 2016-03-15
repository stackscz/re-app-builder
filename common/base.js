var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');

var Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');

var webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools-configuration')).development();

var config = new WebpackConfig();

var externalConfigPath = here('webpack.config.js');
try {
	var externalConfig = require(externalConfigPath);
	config.merge(externalConfig);
	console.log('Using external config.');
} catch (e) {
	console.log('External config not found.');
}

module.exports = config.merge({
	resolve: {
		root: here('node_modules')
	},
	resolveLoader: {
		fallback: path.join(__dirname, "..", "node_modules")
	},
	plugins: [
		webpack_isomorphic_tools_plugin
	],
	module: {
		preLoaders: [
			{
				test: /\.(js|jsx)$/,
				include: [here('src'), here('apps')],
				loader: 'eslint'
			}
		],
		loaders: [
			{
				test: /\.json$/,
				loader: 'json',
			},
			{
				test: /\.css$/,
				loader: 'style!css',
			},
			//{
			//	test: /\.sass/,
			//	loader: 'style!css!sass?outputStyle=expanded&indentedSyntax'
			//},
			//{
			//	test: /\.scss/,
			//	loader: 'style!css!sass?outputStyle=expanded'
			//},
			{
				//test: /\.less/,
				test: webpack_isomorphic_tools_plugin.regular_expression('styles'),
				loader: 'style!css!less',
			},
			{
				test: /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9\.=\-]+)?$/,
				loader: 'url?limit=32768&name=[hash].[ext]'
			},
			{
				test: webpack_isomorphic_tools_plugin.regular_expression('images'),
				loaders: [
					'url?limit=32768&name=[hash].[ext]',
					'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
				]
			},
		]
	}
});
