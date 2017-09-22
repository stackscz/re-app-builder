const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer, extractTextPlugin }) => {

	const extractCss = new ExtractTextPlugin(
		{
			filename: "[name].[contenthash].css",
			// filename: "[name].css",
			disable: isDevServer,
		}
	);

	const config = {
		module: {
			rules: [
				{
					test: /\.css/,
					use: ExtractTextPlugin.extract(
						{
							use: [
								{
									loader: "css-loader",
									options: {
										minimize: process.env.NODE_ENV === 'production',
									},
								},
								// {
								// 	loader: 'postcss-loader',
								// 	options: { plugins: [autoprefixer, precss] }
								// },
								{
									loader: "resolve-url-loader"
								},
							],
							// use style-loader in development
							fallback: "style-loader"
						}
					)
				}
			]
		},
		plugins: [
			extractTextPlugin,
		],
	};

	return webpackMerge(baseConfig, config);

};
