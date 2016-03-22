var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var baseConfigs = require(path.join(__dirname, './base'));

module.exports = baseConfigs.map(function(baseConfig) {

	var config = new WebpackConfig().merge(baseConfig);

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

	config.merge({
		plugins: [
			new ExtractTextPlugin('[name].css')
		]
	});

	return config.toObject();

});
