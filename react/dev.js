var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var config = {};
config[path.join(__dirname, './base')] = function (config) {

	_.each(config.module.loaders, function (loader, key) {

		var loaders = null;
		if (loader.loader) {
			loaders = loader.loader.split('!');
		} else {
			loaders = loader.loaders;
		}

		if (loaders[0] == 'style') {
			var sloader = loaders.shift();
			var rest = loaders.join('!');
			loader.loader = ExtractTextPlugin.extract(sloader, rest);
			delete loader.loaders;
		}

	});

	return config;
};

module.exports = new WebpackConfig().extend(config).merge({
	plugins: [
		new ExtractTextPlugin('[name].css'),
	]
});

//console.log(module.exports.module.loaders);
//process.exit();
