const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {

	const extractLess = new ExtractTextPlugin(
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
					test: /\.less/,
					use: extractLess.extract(
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
								{
									loader: "less-loader"
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
			extractLess,
		],
	};

	return webpackMerge(baseConfig, config);

};
