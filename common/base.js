var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');
var _ = require('lodash');

var Webpack_isomorphic_tools_plugin = require('webpack-isomorphic-tools/plugin');

var webpack_isomorphic_tools_plugin = new Webpack_isomorphic_tools_plugin(require('./webpack-isomorphic-tools-configuration')).development();

var externalConfigPath = here('webpack.config.js');
var externalConfigs = null;
try {
	externalConfigs = require(externalConfigPath);
	if (!_.isArray(externalConfigs)) {
		externalConfigs = [externalConfigs];
	}
	console.log('Using external config.');
} catch (e) {
	console.log('External config not found.');
	externalConfigs = [{}];
}

var configs = externalConfigs.map(function (config) {
	return (new WebpackConfig()).merge(config);
});

module.exports = configs.map(function (config) {
	config.merge({
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
					include: [here('src'), here('apps'), here('examples')],
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

	return config.toObject();
});
