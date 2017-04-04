var prompt = require('prompt');
var _ = require('lodash');
var path = require('path');
var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');

const projectDirName = process.cwd();
const projectPackage = require(path.resolve(projectDirName, 'package.json'));
const baseConfigFactory = require('./configs/base');
const userConfigFactory = require(path.resolve(projectDirName, 'webpack.config.js'));

const [_1, _2, command] = process.argv;
const devserver = command === 'dev' || _.startsWith(command, 'dev:');

let userConfig = userConfigFactory;
if(_.isFunction(userConfigFactory)) {
	userConfig = userConfigFactory(); // TODO pass environment, https://gitlab.stacks.cz/brabeji/re-app-builder/issues/2
}

const vendorPromise = new Promise(function (resolve, reject) {

	switch (command) {
		case 'dev':
			const vendorConfigFactory = require('./configs/vendor');
			const vendorConfig = vendorConfigFactory(
				projectPackage,
				{ projectDirName: projectDirName, excludedModules: userConfig.excludedModules },
				userConfig
			);
			const vendorCompiler = webpack(
				vendorConfig
			);
			vendorCompiler.run((err, stats) => {
				if (err || stats.hasErrors()) {
					console.error(err || stats.toString());
					reject();
					return;
				}
				resolve();
				console.log('Vendor DLLs generated');
			});
			break;
		default:
			resolve();
			break;
	}

});
vendorPromise.then(function () {


	const config = baseConfigFactory(
		userConfig,
		{ projectDirName: projectDirName, devserver: devserver }
	);

	const compiler = webpack(config);

	const host = config.devServer.host;
	const port = config.devServer.port;
	switch (command) {
		case 'dev':
			new WebpackDevServer(
				compiler,
				config.devServer
			).listen(port, host, function (err) {
				if (err) {
					return console.log(err);
				}
				console.log('Listening at ' + host + ':' + port);
			});
			break;
		case 'build':

			compiler.run((err, stats) => {
				if (err || stats.hasErrors()) {
					console.error(err || stats.toString());
					return;
				}
				console.log('build');
			});
			break;
		default:
			console.error('No command specified')
	}

}).catch(console.log);
