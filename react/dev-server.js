var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');
//var rmdir = require('rimraf');
//var WebpackDevServer = require('webpack-dev-server');

var port = 8080;
var ip = '127.0.0.1';


var publicPath = '/';
var contentBase = here();
try {
	fs.statSync(here('examples'));
	contentBase = here('examples');
} catch (e) {
}
try {
	fs.statSync(here('public'));
	contentBase = here('public');
} catch (e) {
}


var baseConfigs = require(path.join(__dirname, './base'));

module.exports = baseConfigs.map(function (baseConfig) {

	var config = new WebpackConfig().merge(baseConfig);

	_.each(config.entry, function (entry, key) {
		if (_.isArray(entry)) {
			config.entry[key].unshift('webpack/hot/only-dev-server');
			config.entry[key].unshift('webpack-dev-server/client?http://' + ip + ':' + port);
		}
	});

	// TODO https://github.com/stackscz/re-app-builder/issues/1
	/*
	 config.module.loaders.unshift({
	 test: /\.(js|jsx)$/,
	 loader: 'react-hot',
	 include: [here('src'), here('examples'), here('apps')]
	 });
	 */

	config.merge({
		//cache: true,
		//devtool: 'eval',
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoErrorsPlugin()
		],
		output: {
			publicPath: 'http://127.0.0.1:8080/'
		}
	});

	return config.toObject();

});

// cleanup build directory
//rmdir(config.output.path, function (error) {
//	if (error) {
//		console.error(error);
//		return;
//	}
//
//	new WebpackDevServer(webpack(config)).listen(port, ip, function (err) {
//		if (err) {
//			return console.log(err);
//		}
//
//		console.log('Listening at ' + ip + ':' + port);
//	});
//});
