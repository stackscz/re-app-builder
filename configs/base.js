/* eslint-disable */

var webpack = require('webpack');
var _ = require('lodash');
var path = require('path');
var fs = require('fs');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
var env = require('node-env-file');


module.exports = function (config, options) {

	let projectPackage;
	let projectName = 'Web Project';
	try {
		projectPackage = require(path.resolve(options.projectDirName, 'package.json'));
		projectName = 'dev | ' + projectPackage.name;
	} catch (error) {
		console.error(error);
		return;
	}

	env(path.resolve(options.projectDirName, '.env'));

    let processEnvConsts = Object.assign({}, process.env, {
        DEVSERVER: process.env.DEVSERVER || false,
        REDUX_LOGGING_ENABLED: process.env.REDUX_LOGGING_ENABLED || false,
        DEBUG_LOGGING_ENABLED: process.env.DEBUG_LOGGING_ENABLED || false,
        REACT_PERF_ENABLED_ENABLED: process.env.REACT_PERF_ENABLED_ENABLED || false,
        DELAY_RESOURCE_SERVICE_RESPONSE: process.env.DELAY_RESOURCE_SERVICE_RESPONSE || false,
        NODE_ENV: process.env.NODE_ENV || 'production',
    });

    processEnvConsts = _.mapValues(processEnvConsts, (a) => {
        return JSON.stringify(a);
    });

	const PORT = parseInt(process.env.PORT) || _.get(config, 'devServer.port', 8080);
	const HOST = process.env.HOST || _.get(config, 'devServer.host', '0.0.0.0');

	const publicPath = process.env.PUBLIC_PATH || _.get(config, 'output.publicPath', '/build/');
	const publicPathMatch = publicPath.replace(/^\//, '').replace(/\/$/, '');
	const rewriteRegex = new RegExp('^\/(?!(' + publicPathMatch + '|favicon|swagger|config\.js|examples)).*', 'g');

	const outputPath = _.get(config, 'output.path', path.resolve(options.projectDirName, 'public', 'build'));

	config = _.defaultsDeep(
		config,
		{
			output: {
				filename: '[name].js',
				path: outputPath,
				pathinfo: true,
				publicPath,
			},
			devServer: {
				historyApiFallback: {
					index: 'index-dev.html',
					rewrites: [
						{ from: rewriteRegex, to: '/' + publicPathMatch + '/index-dev.html' },
					],
				},
				staticOptions: {
					fallthrough: true,
					index: 'index-dev.html',
				},
				contentBase: path.resolve(options.projectDirName, _.get(config, 'devServer.contentBase', 'public')),
				publicPath,
				host: HOST,
				port: PORT,
				hot: true,
				inline: false,
				stats: {
					hash: false,
					colors: true,
					chunks: false,
					chunkModules: false,
					version: false,
					reasons: true
				},
				proxy: _.assign({
					'/api/**': {
						changeOrigin: true,
						target: process.env.API_URL,
						onError: () => ({}),
					},
				}, _.get(config, 'devServer.proxy', {})),
			},
		}
	);

	const devserver = options.devserver;

	let babelPolyfillAlreadyIncluded = false;
	config.entry = _.mapValues(config.entry, function (entry, key) {
		if (_.isString(entry)) {
			entry = [entry];
		}
		// entry = _.map(entry, function (entryPart) {
		// 	return path.resolve(options.projectDirName, entryPart);
		// });

		// const a = require('webpack/hot/dev-server');
		// console.log(a);

		if (devserver) {
			entry.unshift(
				'webpack/hot/dev-server',
				'webpack-dev-server/client?http://localhost:' + PORT
			);
			const isReactApp = _.get(projectPackage, 'dependencies.react', false);
			if (isReactApp) {
				entry.unshift('react-hot-loader/patch');
			}
		}
		if (!babelPolyfillAlreadyIncluded) {
			babelPolyfillAlreadyIncluded = true;
			entry.unshift(
				'babel-polyfill'
			);
		}
		return entry;
	});

	// const context = path.resolve(__dirname, '..');
	// const context = '.';
	const context = options.projectDirName;

	// try {
	// 	require(path.resolve(options.projectDirName, '.babelrc'));
	// 	return;
	// } catch (error) {
	// 	console.log('>>>>>>>>>ERR', error);
	// }
	//
	// console.log(babelConfig);

	const plugins = [
		new webpack.DefinePlugin({
			'process.env': processEnvConsts,
		}),
		new webpack.LoaderOptionsPlugin({
			minimize: process.env.NODE_ENV === 'production',
			// debug: process.env.NODE_ENV === 'development',
			options: {
				sassLoader: {
					includePaths: [
						path.resolve(options.projectDirName, 'src')
					]
				},
				// context: path.resolve(options.projectDirName),
				context: context,
				output: config.output,
				postcss: function () {
					return [precss, autoprefixer];
				}
			}
		}),
		new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /(en-gb)/),
	];

	try {
		fs.statSync(path.resolve(options.projectDirName, 'src/templates/index.ejs'));
		plugins.push(
			new HtmlWebpackPlugin({
				title: projectName,
				filename: path.resolve(options.projectDirName, 'public/index.html'),
				template: '!!ejs-loader!src/templates/index.ejs',
				inject: false,
				hash: true,
			})
		)
	} catch (e) {
		// do nothing
	}


	var devHtmlPath = path.resolve(
		_.get(
			config,
			'output.path',
			path.resolve(options.projectDirName, 'public', 'build')
		),
		'index-dev.html'
	);

	if (devserver) {
		plugins.pop();
		const templatePath = path.resolve(__dirname, 'index-dev.ejs');
		plugins.push(
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NamedModulesPlugin(),
			new webpack.DllReferencePlugin({
				context: options.projectDirName,
				manifest: require(path.resolve(options.projectDirName, 'manifest', 'vendor-manifest.json')),
			}),
			new HtmlWebpackPlugin({
				title: projectName,
				filename: devHtmlPath,
				template: '!!ejs-loader!' + templatePath,
				inject: false,
				hash: true,
			})
		)
	} else {
		plugins.push(
			new ExtractTextPlugin('[name].css')
		)
	}
	if (config.stats) {
		plugins.push(
			new BundleAnalyzerPlugin()
		);
	}

	if (process.env.NODE_ENV === 'production') {
		plugins.push(
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: true
				}
			})
		);
		plugins.push(
			new webpack.optimize.AggressiveMergingPlugin()
		);
	}

	var rules = [
		{
			test: /\.(js|jsx)$/,
			loaders: [
				'babel-loader?babelrc=false&extends=' + path.resolve(options.projectDirName, '.babelrc')
			],
			// exclude: /(node_modules|bower_components)/,
			include: [
				path.resolve(options.projectDirName, 'node_modules', 'generic-pool'),
				path.resolve(options.projectDirName, 'src'),
				path.resolve(options.projectDirName, 'specs'),
				path.resolve(options.projectDirName, 'examples'),
				path.resolve(options.projectDirName, 'initialState.js'),
				// path.join(options.projectDirName, 'node_modules', 'generic-pool'),
			]
		},
		{
			test: /\.json$/,
			loader: 'json-loader'
		},
		{
			test: /\.css$/,
			loaders: devserver ? (
				[
					'style-loader',
					'css-loader',
					'postcss-loader',
				]
			) : (
				         ExtractTextPlugin.extract({
					         fallbackLoader: 'style-loader',
					         loader: [
						         {
							         loader: 'css-loader',
							         query: {
								         minimize: true,
							         },
						         },
						         {
							         loader: 'postcss-loader',
						         },
					         ]
				         })
			         ),
		},
		{
			test: /\.less/,
			loader: devserver ? (
				[
					'style-loader',
					'css-loader',
					'postcss-loader',
					'less-loader',
				]
			) : (
				        ExtractTextPlugin.extract({
					        fallbackLoader: 'style-loader',
					        loader: [
						        {
							        loader: 'css-loader',
							        query: {
								        minimize: true,
							        },
						        },
						        {
							        loader: 'postcss-loader',
						        },
						        {
							        loader: 'less-loader',
						        },
					        ],
				        })
			        )
		},
		{
			test: /\.sass/,
			loader: devserver ? (
				['style-loader', 'css-loader', 'postcss-loader', 'resolve-url-loader', {
					loader: 'sass-loader',
					query: { sourceMap: true }
				}]
			) : (
				        ExtractTextPlugin.extract({
					        fallbackLoader: 'style-loader',
					        loader: [
						        {
							        loader: 'css-loader',
							        query: {
								        minimize: true,
							        },
						        },
						        {
							        loader: 'postcss-loader',
						        },
						        {
							        loader: 'resolve-url-loader',
						        },
						        {
							        loader: 'sass-loader',
							        query: {
								        sourceMap: true,
							        },
						        },
					        ],
				        })
			        )
		},


		// Fonts loaders
		{
			test: /\.(woff(2)?)(\?[a-z0-9\.=\-]+)?$/,
			loader: "url-loader?limit=16384&name=fonts/[hash].[ext]&mimetype=application/font-woff"
		},
		{
			test: /\.(ttf)(\?[A-Za-z0-9&#\.=\-]+)?$/,
			loader: "url-loader?limit=16384&name=fonts/[hash].[ext]"
		},
		{
			test: /\.(eot)(\?[a-z0-9\.=\-]+)?$/,
			loader: "url-loader?limit=16384&name=fonts/[hash].[ext]"
		},
		{
			test: /\.(svg)(\?[a-z0-9\.=\-]+)$/,
			loader: "file-loader?limit=16384&name=fonts/[hash].[ext]"
		},


		// Images loaders
		{
			test: /\.(jpe?g|png|gif|svg)$/i,
			loaders: [
				'url-loader?limit=8192&name=[hash].[ext]',
				'image-webpack-loader?bypassOnDebug&optimizationLevel=7&interlaced=false'
			]
		}
	].concat(_.get(config, 'module.rules', []));

	var babelRuntimePath = path.resolve(__dirname, '..', 'node_modules', 'babel-runtime');
	try {
		fs.statSync(babelRuntimePath)
	} catch (error) {
		babelRuntimePath = path.resolve(options.projectDirName, 'node_modules', 'babel-runtime');
	}

	return {
		devtool: false, //devserver ? 'cheap-module-eval-source-map' : false,
		entry: config.entry,
		output: config.output,
		context: context,
		resolve: {
			// alias: _.get(config, 'resolve.alias', {}),
			alias: _.merge(
				_.get(config, 'resolve.alias', {}),
				{
					// 'babel-runtime': fs.realpathSync(path.resolve(__dirname, 'node_modules', 'babel-runtime'))
					'babel-runtime': babelRuntimePath,
				}
			),
			modules: [
				path.resolve(options.projectDirName, "node_modules"),
				'web_modules',
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			],
		},
		resolveLoader: {
			modules: [
				'node_modules',
				'./node_modules/re-app-builder/node_modules',
			]
		},
		plugins: plugins,
		module: {
			rules: rules,
		},
		devServer: config.devServer
	};
};
