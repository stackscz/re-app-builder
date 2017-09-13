const path = require('path');
const webpack = require('webpack');
const mergeSassFeatureConfig = require('./features/sass');
const mergeImagesFeatureConfig = require('./features/images');
const mergeEs7FeatureConfig = require('./features/es7');

module.exports = ({ projectRootDirectory, isDevServer = false }) => {

	const plugins = [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new webpack.EnvironmentPlugin({ NODE_ENV: 'production' }),
	];

	if (process.env.NODE_ENV === 'production') {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: true
				}
			})
		);
		plugins.push(
			new webpack.optimize.AggressiveMergingPlugin()
		);
	}

	let baseConfig = {
		node: { fs: 'empty' }, // workaround bug in css-loader
		plugins,
		stats: {
			colors: true,
		},
		devServer: {
			contentBase: './public/',
			stats: {
				colors: true,
			},
		},
		resolveLoader: {
			modules: [
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			]
		},
	};

	baseConfig = mergeSassFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeImagesFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeEs7FeatureConfig({ baseConfig, isDevServer, projectRootDirectory });

	return baseConfig;

};
