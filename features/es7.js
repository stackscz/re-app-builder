const omit = require('lodash/omit');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {
	const config = {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: [
						{
							loader: 'babel-loader',
						}
					],
				}
			]
		},
		plugins: [],
	};

	return webpackMerge(baseConfig, config);

};
