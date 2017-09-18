const omit = require('lodash/omit');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {
	const config = {
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					// function (a, b) {
					// 	// console.log(a);
					// 	const c = a.match(/node_modules/i);// || a.match(/re-app-builder/i);
					// 	if (!c) {
					// 		console.log(a);
					// 		return false;
					// 		// process.exit();
					// 	}
					// 	// console.log(b.length);
					// 	// process.exit();
					// 	return !!c.length;
					// },
					use: [
						{
							loader: 'babel-loader',
							options: {
								// ignore: '/node_modules/',
								// passPerPreset: true,
								presets: [
									'react',
									'es2015',
									'stage-0'
								],
								plugins: [
									'syntax-flow',
									'transform-runtime',
									'tcomb',
									'transform-flow-strip-types'
								]
							}
						}
					],
				}
			]
		},
		plugins: [],
	};

	return webpackMerge(baseConfig, config);

};
