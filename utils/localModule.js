var path = require('path');
module.exports = function (moduleName) {
	return [path.join(__dirname, '../node_modules'), moduleName].join('/');
};
