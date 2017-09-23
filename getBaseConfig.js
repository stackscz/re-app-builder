const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const mergeSassFeatureConfig = require('./features/sass');
const mergeLessFeatureConfig = require('./features/less');
const mergeCssFeatureConfig = require('./features/css');
const mergeFontsFeatureConfig = require('./features/fonts');
const mergeImagesFeatureConfig = require('./features/images');
const mergeEs7FeatureConfig = require('./features/es7');

const stats = {
	// Add asset Information
	assets: false,
	// Sort assets by a field
	assetsSort: "field",
	// Add information about cached (not built) modules
	cached: true,
	// Show cached assets (setting this to `false` only shows emitted files)
	cachedAssets: false,
	// Add children information
	children: true,
	// Add chunk information (setting this to `false` allows for a less verbose output)
	chunks: false,
	// Add built modules information to chunk information
	chunkModules: false,
	// Add the origins of chunks and chunk merging info
	chunkOrigins: false,
	// Sort the chunks by a field
	chunksSort: "field",
	// Context directory for request shortening
	// context: "../src/",
	// `webpack --colors` equivalent
	colors: true,
	// Display the distance from the entry point for each module
	depth: false,
	// Display the entry points with the corresponding bundles
	entrypoints: false,
	// Add errors
	errors: true,
	// Add details to errors (like resolving log)
	errorDetails: true,
	// Exclude assets from being displayed in stats
	// This can be done with a String, a RegExp, a Function getting the assets name
	// and returning a boolean or an Array of the above.
	// excludeAssets: ,
	// Exclude modules from being displayed in stats
	// This can be done with a String, a RegExp, a Function getting the modules source
	// and returning a boolean or an Array of the above.
	// excludeModules: ,
	// See excludeModules
	// exclude: ,
	// Add the hash of the compilation
	hash: true,
	// Set the maximum number of modules to be shown
	maxModules: 5,
	// Add built modules information
	modules: false,
	// Sort the modules by a field
	modulesSort: "field",
	// Show dependencies and origin of warnings/errors (since webpack 2.5.0)
	moduleTrace: true,
	// Show performance hint when file size exceeds `performance.maxAssetSize`
	performance: false,
	// Show the exports of the modules
	providedExports: false,
	// Add public path information
	publicPath: true,
	// Add information about the reasons why modules are included
	reasons: true,
	// Add the source code of modules
	source: true,
	// Add timing information
	timings: true,
	// Show which exports of a module are used
	usedExports: false,
	// Add webpack version information
	version: true,
	// Add warnings
	warnings: true,
	// Filter warnings to be shown (since webpack 2.4.0),
	// can be a String, Regexp, a function getting the warning and returning a boolean
	// or an Array of a combination of the above. First match wins.
	// warningsFilter
};

module.exports = ({ projectRootDirectory, isDevServer = false }) => {

	const plugins = [
		new webpack.optimize.ModuleConcatenationPlugin(),
		new ExtractTextPlugin(
			{
				filename: '[name].css',
				disable: isDevServer,
			}
		),
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
		devtool: false,
		node: { fs: 'empty' }, // workaround bug in css-loader
		plugins,
		stats,
		devServer: {
			stats,
		},
		resolveLoader: {
			modules: [
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			],
		},
	};

	baseConfig = mergeSassFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeLessFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeCssFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeFontsFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeImagesFeatureConfig({ baseConfig, isDevServer, projectRootDirectory });
	baseConfig = mergeEs7FeatureConfig({ baseConfig, isDevServer, projectRootDirectory });

	return baseConfig;

};
