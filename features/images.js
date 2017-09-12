const webpack = require('webpack');
const webpackMerge = require('webpack-merge');

module.exports = ({ baseConfig, projectRootDirectory, isDevServer }) => {

	const config = {
		module: {
			rules: [
				{
					test: /\.(jpe?g|png|gif|svg)$/i,
					use: [
						{
							loader: 'url-loader',
							options: {
								limit: 8192,
								name: '[hash].[ext]',
							}
						},
						// {
						// 	loader: 'file-loader',
						// 	options: {
						// 		hash: 'sha512',
						// 		digest: 'hex',
						// 		name: '[hash].[ext]',
						// 		// publicPath: '/',
						// 		// outputPath: 'build/'
						// 	}
						// },
						{
							loader: 'image-webpack-loader',
							options: {
								// gifsicle: {
								// 	interlaced: false,
								// },
								// optipng: {
								// 	optimizationLevel: 7,
								// },
								// pngquant: {
								// 	quality: '65-90',
								// 	speed: 4
								// },
								// mozjpeg: {
								// 	progressive: true,
								// 	quality: 65
								// },
								// // Specifying webp here will create a WEBP version of your JPG/PNG images
								// webp: {
								// 	quality: 75
								// }
							}
						}
					]
				}
			]
		},
		plugins: [],
	};

	return webpackMerge(baseConfig, config);

};
