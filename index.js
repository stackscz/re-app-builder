const isFunction = require('lodash/isFunction');
const startsWith = require('lodash/startsWith');
const g = require('lodash/get');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackMerge = require('webpack-merge');
const getBaseConfig = require('./getBaseConfig');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// parse command
const [_1, _2, command] = process.argv;
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
const userConfig = require(path.resolve(projectRootDirectory, 're-app-builder.config.js'));
let finalConfig = userConfig;


// produce finalConfig
if (isFunction(userConfig)) {
	const mergeSassFeatureConfig = require('./features/sass');
	const mergeEs7FeatureConfig = require('./features/es7');
	const mergeImagesFeatureConfig = require('./features/images');
	const mergeHtmlFeatureConfig = require('./features/html');
	const options = {
		projectRootDirectory,
		baseConfig,
		isDevServer,
		mergeWithBaseConfig: (userConfigInput) => {
			return webpackMerge(baseConfig, userConfigInput)
		},
		mergeSassFeatureConfig,
		mergeEs7FeatureConfig,
		mergeImagesFeatureConfig,
		mergeHtmlFeatureConfig,
		webpack,
	};
	finalConfig = userConfig(options);
} else {
	finalConfig = webpackMerge(baseConfig, userConfig);
}
// console.log(JSON.stringify(finalConfig, null, 2));

if (command === 'analyze') {
	var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
	finalConfig = webpackMerge(finalConfig, { plugins: [new BundleAnalyzerPlugin()] })
}


// run webpack
const compiler = webpack(finalConfig);
// const serverCallback = (error, stats) => {
// 	if (error) {
// 		console.log(JSON.stringify(error, null, 2));
// 		process.exit(1);
// 	}
// 	const statsOutputOptions = finalConfig.stats;
// 	console.log(stats.toString(statsOutputOptions));
// };

const port = g(finalConfig, 'devServer.port', 8080);
const host = g(finalConfig, 'devServer.host', 'localhost');

switch (command) {
	case 'dev':
		new WebpackDevServer(
			compiler,
			finalConfig.devServer
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
					console.log(JSON.stringify(error, null, 2));
					process.exit(1);
				}
				const statsOutputOptions = finalConfig.stats;
				console.log(stats.toString(statsOutputOptions));
			}
		);
		break;
}

