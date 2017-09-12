const path = require('path');
const webpack = require('webpack');
const mergeSassFeatureConfig = require('./features/sass');
const mergeImagesFeatureConfig = require('./features/images');

module.exports = ({ projectRootDirectory, isDevServer = false }) => {

	const plugins = [];

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
		plugins,
		devServer: {},
		resolveLoader: {
			modules: [
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			]
		},
	};

	baseConfig = mergeSassFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeImagesFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });

	return baseConfig;

};
