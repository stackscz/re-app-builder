const NodeOutputFileSystem = require('webpack/lib/node/NodeOutputFileSystem');

const plugin = function () {
};
plugin.prototype.apply = function (compiler) {
	compiler.plugin('emit', (compilation, callback) => {
		compiler.outputFileSystem = new NodeOutputFileSystem(); // eslint-disable-line
		callback();
	});
};

module.exports = plugin;
