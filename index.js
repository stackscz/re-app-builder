const isFunction = require('lodash/isFunction');
const startsWith = require('lodash/startsWith');
const path = require('path');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackMerge = require('webpack-merge');
const getBaseConfig = require('./getBaseConfig');


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
	const options = {
		projectRootDirectory,
		baseConfig,
		isDevServer,
		mergeWithBaseConfig: (userConfigInput) => {
			return webpackMerge(baseConfig, userConfigInput)
		}
	};
	finalConfig = userConfig(options);
} else {
	finalConfig = webpackMerge(baseConfig, userConfig);
}
// console.log(JSON.stringify(finalConfig, null, 2));




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

const port = finalConfig.devServer.port || 8080;
const host = finalConfig.devServer.host || 'localhost';

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

	default:
		console.error('No command specified')
}

