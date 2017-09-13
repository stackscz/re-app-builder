// const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {

	const config = {
		module: {
			rules: [
				{
					test: /\.js/,
					exclude: /node_modules/i,
					use: [
						{
							loader: 'babel-loader',
							options:{
								presets:[
									'react',
									'es2015',
									'stage-0'
								],
								plugins:[
									'syntax-flow',
									'transform-runtime',
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
