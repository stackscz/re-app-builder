#!/usr/bin/env node

const isFunction = require('lodash/isFunction');
const startsWith = require('lodash/startsWith');
const isArray = require('lodash/isArray');
const find = require('lodash/find');
const g = require('lodash/get');
const first = require('lodash/first');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackMerge = require('webpack-merge');
const getBaseConfig = require('./getBaseConfig');


// parse command
var argv = require('minimist')(process.argv.slice(2));
const command = first(argv._);
const isDevServer = command === 'dev' || startsWith(command, 'dev:');


// determine project root directory
const projectRootDirectory = process.cwd();


// require base config
const baseOptions = {
	projectRootDirectory,
	isDevServer,
};
const baseConfig = getBaseConfig(baseOptions);


// require user config
const userConfig = require(path.resolve(projectRootDirectory, argv.config || 're-app-builder.config.js'));
let finalConfig = userConfig;


// produce finalConfig
if (isFunction(userConfig)) {
	const ForceNodeOutputFileSystemPlugin = require('./plugins/ForceNodeOutputFileSystemPlugin');
	const mergeSassFeatureConfig = require('./features/sass');
	const mergeEs7FeatureConfig = require('./features/es7');
	const mergeImagesFeatureConfig = require('./features/images');
	const mergeHtmlFeatureConfig = require('./features/html');
	const options = {
		projectRootDirectory,
		baseConfig,
		isDevServer,
		mergeWithBaseConfig: (userConfigInput, options) => {
			return webpackMerge(baseConfig, userConfigInput)
		},
		mergeSassFeatureConfig,
		mergeEs7FeatureConfig,
		mergeImagesFeatureConfig,
		mergeHtmlFeatureConfig,
		webpack,
		ForceNodeOutputFileSystemPlugin,
	};
	finalConfig = userConfig(options);
} else {
	finalConfig = webpackMerge(baseConfig, userConfig);
}

if (!isArray(finalConfig)) {
	finalConfig = [finalConfig];
}

if (command === 'analyze') {
	var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
	finalConfig = finalConfig.map((config) => webpackMerge(config, { plugins: [new BundleAnalyzerPlugin()] }))
}

// prepare webpack compiler instance
const compiler = webpack(finalConfig);

// run command
switch (command) {
	case 'dev':
		const devServerConfig = find(finalConfig, (config) => {return g(config, 'devServer.contentBase')});
		const port = g(devServerConfig, 'devServer.port', parseInt(process.env.DEV_PORT, 10));
		const host = g(devServerConfig, 'devServer.host', 'localhost');
		new WebpackDevServer(
			compiler,
			devServerConfig.devServer
		).listen(port, host, function (err) {
			if (err) {
				console.log(err);
				process.exit(1);
			}
			console.log('Listening at ' + host + ':' + port);
		});
		break;

	case 'build':
	default:
		compiler.run(
			(error, stats) => {
				if (error) {
					console.log(error);
					process.exit(1);
				}
				const statsOutputOptions = finalConfig.stats;
				console.log(stats.toString(statsOutputOptions));
			}
		);
		break;
}

