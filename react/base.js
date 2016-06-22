var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var join = path.join;
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');

var srcPath = here('src');

var baseConfigs = require(join(__dirname, '../common/base'));

var builderrcFilePath = here('.builderrc');
try {
	fs.statSync(builderrcFilePath);
} catch (e) {
	builderrcFilePath = null;
}


module.exports = baseConfigs.map(function (baseConfig) {

	var config = new WebpackConfig().merge(baseConfig);

	if (config.useDefaultEntryPoints !== false) {
		var knownModuleSpaces = {
			'examples/index': './examples',
			'app/index': './public',
			index: './src'
		};
		_.each(knownModuleSpaces, function (moduleName, outputPath) {
			var modulePath = here(moduleName);
			try {
				require.resolve(modulePath);
				console.error('module space "' + modulePath + '" present!');
				if (!config.entry) {
					config.entry = {};
				}
				if (!config.entry[outputPath]) {
					config.entry[outputPath] = [moduleName];
				}
			} catch (e) {
			}
		});
	}

	config.merge({
		resolve: {
			extensions: ['', '.js', '.jsx'],
			alias: {
				actions: join(srcPath, 'actions'),
				reducers: join(srcPath, 'reducers'),
				components: join(srcPath, 'components'),
				containers: join(srcPath, 'containers'),
				store: join(srcPath, 'store'),
				styles: join(srcPath, 'styles'),
				utils: join(srcPath, 'utils')
			}
		},
		output: {
			path: here('./lib'),
			filename: '[name].js',
			publicPath: '/'
		},
		module: {
			preLoaders: [
				{
					test: /\/(components|containers)\/.+\.(js|jsx)$/,
					loader: 'baggage-loader?index.less',
					include: [here('src'), here('examples'), here('apps')]
				}
			],
			loaders: [
				{
					test: /\.(js|jsx)$/,
					loader: 'babel',
					include: [here('src'), here('examples'), here('apps')],
					query: {
						presets: [
							'es2015',
							'react',
							'stage-1',
						],
						plugins: [
							'transform-decorators-legacy',
							'transform-runtime',
						],
						babelrc: !!builderrcFilePath,
						'extends': builderrcFilePath
					}
				}
			]
		},
	});
	return config.toObject();
});
