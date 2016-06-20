if (typeof process.env.NODE_ENV === 'undefined') {
	process.env.NODE_ENV = 'development';
}

var _ = require("lodash");
var fs = require("fs");
var webpack = require("webpack");
var path = require("path");
var here = require("../../utils/here");
var WebpackDevServer = require('webpack-dev-server');

var port = 8080;
var ip = '127.0.0.1';

var args = process.argv.slice(2);

if (!args[0]) {
	console.log('No command specified');
	return;
}
var command = args[0];

var targetAppName = null;
var targetApp = null;
if (args[1]) {
	targetAppName = args[1];
	targetApp = {
		name: targetAppName,
		dir: here('apps', targetAppName)
	}
}

var commandSpec = command.split(':');
var configPath = null;
var isDevServer = false;
var isWatch = false;

if (commandSpec[0] === 'dev') {
	// run dev server
	configPath = path.join(__dirname, '..', 'dev-server.js');
	isDevServer = true;
} else if (commandSpec[0] === 'build') {
	// build
	var envSpec = commandSpec[1] || 'prod';
	configPath = path.join(__dirname, '..', envSpec + '.js');
	isWatch = commandSpec[2] && commandSpec[2] === 'watch';
} else {
	console.log('Unknown command');
	return;
}

//var config = require(configPath);

// compile or watch root app and sub apps
forAllApps(function (appName, appRootPath) {

		var config = require(configPath);

		// TODO fix multiple apps feature
		//var configEdit = function (config) {
		//	config.output.path = path.join(appRootPath, 'lib');
		//
		//	var knownModuleSpaces = {
		//		'examples/index': path.join(appRootPath, 'examples'),
		//		'app/index': path.join(appRootPath, 'public'),
		//		index: path.join(appRootPath, 'src')
		//	};
		//	_.each(knownModuleSpaces, function (moduleName, outputPath) {
		//		//var modulePath = path.join(appRootPath, moduleName);
		//		var modulePath = moduleName;
		//		try {
		//			require.resolve(modulePath);
		//			console.error('module space "' + modulePath + '" present!');
		//			if (!config.entry) {
		//				config.entry = {};
		//			}
		//			config.entry[outputPath] = [moduleName];
		//		} catch (e) {
		//		}
		//	});
		//	if (isDevServer) {
		//		_.each(config.entry, function (entry, key) {
		//			if (_.isArray(entry)) {
		//				config.entry[key].unshift('webpack/hot/only-dev-server');
		//				config.entry[key].unshift('webpack-dev-server/client?http://' + ip + ':' + port);
		//			}
		//		});
		//	}
		//
		//	[
		//		'actions',
		//		'reducers',
		//		'components',
		//		'containers',
		//		'store',
		//		'styles',
		//		'utils',
		//	].map(function (group) {
		//		config.resolve.alias[group] = path.join(appRootPath, 'src', group)
		//	});
		//
		//
		//	return config;
		//};
		//config = configEdit(config);

		var compiler = webpack(config);
		if (isDevServer) {
			var devServerConfig = config.reduce(function (acc, curr) {
				return _.assign(acc, curr.devServer || {});
			}, {});

			devServerConfig = _.defaultsDeep(
				devServerConfig,
				{
					contentBase: path.join(appRootPath, 'public'),
					historyApiFallback: true,
					hot: true,
					inline: true,
					stats: false,
					//stats: {
					//	progress: true,
					//	colors: true
					//},
					port: port,
					publicPath: '/',
					noInfo: false
				}
			);

			new WebpackDevServer(compiler, devServerConfig).listen(port, ip, function (err) {
				if (err) {
					return console.log(err);
				}
				console.log('Listening at ' + ip + ':' + port);
			});
		} else {
			console.log('Compiling app "' + appName + '" from ', appRootPath);
			if (!isWatch) {
				compiler.run(buildCallback);
			} else {
				compiler.watch({ // watch options:
					aggregateTimeout: 300, // wait so long for more changes
					poll: true // use polling instead of native watchers
					// pass a number to set the polling interval
				}, buildCallback);
			}
		}
	}
);

function forAllApps(cb) {
	var appNames = [];
	if (targetAppName) {
		appNames = [targetAppName];
	} else {
		try {
			appNames = getDirectories(here('apps'));
		} catch (e) {
		}
	}

	var apps = [];
	if (!targetAppName) {
		apps.unshift({
			name: 'root',
			dir: here('.')
		});
	} else {
		_.each(appNames, function (appName) {
			apps.push({
				name: appName,
				dir: here('apps', appName)
			});
		});
	}

	_.each(apps, function (app) {
		cb(app.name, app.dir);
	})
}

function buildCallback(err, stats) {
	if (err)
		return handleFatalError(err);
	var jsonStats = stats.toJson();
	if (jsonStats.errors.length > 0)
		return handleSoftErrors(jsonStats.errors);
	if (jsonStats.warnings.length > 0) {
		handleWarnings(jsonStats.warnings);
	}


	successfullyCompiled();
}

function handleWarnings(warnings) {
	console.log(warnings);
}

function handleSoftErrors(errors) {
	console.log(errors);
}

function handleFatalError(err) {
	console.log(err);
}

function successfullyCompiled() {
	console.log('Build complete.');
}

function getDirectories(srcpath) {
	return fs.readdirSync(srcpath).filter(function (file) {
		return fs.statSync(path.join(srcpath, file)).isDirectory();
	});
}
