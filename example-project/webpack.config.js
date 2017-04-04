module.exports = function () {
	return {
		entry: {
			app: ['./src']
		},
		devServer: {
			port: parseInt(process.env.DEV_PORT, 10),
		},
	}
};
