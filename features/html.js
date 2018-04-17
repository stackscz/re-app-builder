// const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer, fileConfigs = [] }) => {

	const config = {
		module: {
			rules: []
		},
		plugins: [
			...fileConfigs.map(
				(opts) => new HtmlWebpackPlugin(Object.assign(opts, { alwaysWriteToDisk: true, excludeChunks: ['main'] }))
			),
			new HtmlWebpackHarddiskPlugin()
		]
	};

	return webpackMerge(baseConfig, config);

};
