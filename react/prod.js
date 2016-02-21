var path = require('path');
var webpack = require('webpack');
var WebpackConfig = require('webpack-config');
var here = require('../utils/here');

module.exports = new WebpackConfig().extend(path.join(__dirname, './dev')).merge({
	plugins: [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: false
		})
	]
});

//console.log(module.exports.plugins);
//process.exit();
