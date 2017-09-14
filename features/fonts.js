const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {

	const extractCss = new ExtractTextPlugin(
		{
			// filename: "[name].[contenthash].css",
			filename: "[name].css",
			disable: isDevServer,
		}
	);

	const config = {
		module: {
			rules: [
				{
					test: /\.(woff(2)?)(\?[a-z0-9\.=\-]+)?$/,
					use: "url-loader?limit=16384&name=fonts/[hash].[ext]&mimetype=application/font-woff"
				},
				{
					test: /\.(ttf)(\?[A-Za-z0-9&#\.=\-]+)?$/,
					use: "url-loader?limit=16384&name=fonts/[hash].[ext]"
				},
				{
					test: /\.(eot)(\?[a-z0-9\.=\-]+)?$/,
					use: "url-loader?limit=16384&name=fonts/[hash].[ext]"
				},
				{
					test: /\.(svg)(\?[a-z0-9\.=\-]+)$/,
					use: "file-loader?limit=16384&name=fonts/[hash].[ext]"
				},
			]
		},
		plugins: [],
	};

	return webpackMerge(baseConfig, config);

};
