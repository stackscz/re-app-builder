const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');
const precss = require('precss');
const autoprefixer = require('autoprefixer');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {

	const config = {
		module: {
			rules: [
				{
					test: /\.s[ac]ss$/,
					use: ExtractTextPlugin.extract(
						{
							use: [
								{
									loader: "css-loader",
									options: {
										minimize: process.env.NODE_ENV !== 'development',
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
									loader: "sass-loader",
									options: {
										sourceMap: true,
									},
								},
							],
							// use style-loader in development
							fallback: "style-loader"
						}
					)
				}
			]
		},
	};

	return webpackMerge(baseConfig, config);

};
