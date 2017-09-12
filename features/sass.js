const ExtractTextPlugin = require('extract-text-webpack-plugin');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, isDevServer }) => {

	console.log();
	console.log(isDevServer);
	console.log();

	const extractSass = new ExtractTextPlugin(
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
					test: /\.sass$/,
					use: extractSass.extract(
						{
							use: [
								{
									loader: "css-loader"
								},
								{
									loader: "sass-loader"
								}
							],
							// use style-loader in development
							fallback: "style-loader"
						}
					)
				}
			]
		},
		plugins: [
			extractSass
		],
	};

	return webpackMerge(baseConfig, config);

};
