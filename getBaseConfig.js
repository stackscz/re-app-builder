const mergeSassFeatureConfig = require('./features/sass');

module.exports = ({ isDevServer = false }) => {

	let baseConfig = {
		plugins: [

		],
		devServer: {
			hot: true,
		},
		resolveLoader: {
			modules: [
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			]
		},
	};

	baseConfig = mergeSassFeatureConfig({ baseConfig, isDevServer });

	return baseConfig;

};
