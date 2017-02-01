/* eslint-disable */

var webpack = require('webpack');
var _ = require('lodash');
var path = require('path');
var nconf = require('nconf');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var precss = require('precss');
var autoprefixer = require('autoprefixer');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

nconf.env().file('.env');

const processEnvConsts = (nconf.get('SUPPORTED_APPS') || [])
	.reduce(
		(acc, appModuleName) => {
			const suffix = appModuleName
				.replace('one-app-', '')
				.replace(/-/g, '_')
				.toUpperCase();

			// Each prop like `SUPPORTED_APPS_RULES: "true"` for `one-app-rules` etc.
			const key = `SUPPORTED_APPS_${suffix}`;

			acc[key] = JSON.stringify(true);

			return acc;
		},
		{
			DEVSERVER: JSON.stringify(process.env.DEVSERVER || false),
			REDUX_LOGGING_ENABLED: JSON.stringify(nconf.get('REDUX_LOGGING_ENABLED') || false),
			DEBUG_LOGGING_ENABLED: JSON.stringify(nconf.get('DEBUG_LOGGING_ENABLED') || false),
			REACT_PERF_ENABLED_ENABLED: JSON.stringify(nconf.get('REACT_PERF_ENABLED_ENABLED') || false),
			DELAY_RESOURCE_SERVICE_RESPONSE: JSON.stringify(nconf.get('DELAY_RESOURCE_SERVICE_RESPONSE') || false),
			NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'production'),
			API_SERVER_HOST: JSON.stringify(process.env.API_SERVER_HOST),
			API_SERVER_PORT: JSON.stringify(process.env.API_SERVER_PORT),
			API_SERVER_SSL: JSON.stringify(process.env.API_SERVER_SSL),
			SUPPORTED_APPS: JSON.stringify(nconf.get('SUPPORTED_APPS') || []),
			// These app-specific consts need to be here - otherwise the app is included in the build all the time.
			SUPPORTED_APPS_RULES: JSON.stringify(false),
		}
	);

module.exports = function (config, options) {

	let projectName = 'Web Project';
	try {
		const projectPackage = require(path.resolve(options.projectDirName, 'package.json'));
		projectName = 'dev | ' + projectPackage.name;
	} catch (error) {
		console.error(error);
		return;
	}

	const PORT = _.get(config, 'devServer.port', 8080);
	const PUBLIC_PATH = '/build/';

	config = _.defaultsDeep(
		config,
		{
			output: {
				filename: '[name].js',
				path: path.resolve(options.projectDirName, 'public', 'build'),
				pathinfo: true,
				publicPath: PUBLIC_PATH,
			},
			devServer: {
				historyApiFallback: {
					index: 'index-dev.html',
					rewrites: [
						{ from: /^\/(?!(build|favicon|swagger|config\.js|examples)).*/g, to: '/build/index-dev.html' },
					],
				},
				staticOptions: {
					fallthrough: true,
					index: 'index-dev.html',
				},
				contentBase: path.resolve(options.projectDirName, 'public'),
				publicPath: PUBLIC_PATH,
				host: '0.0.0.0',
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
				proxy: {
					'/api/**': {
						changeOrigin: true,
						target: nconf.get('API_URL'),
						onError: () => ({}),
					},
					'/websockets/**': {
						changeOrigin: true,
						ws: true,
						target: nconf.get('API_URL'),
					},
					'/signin/**': {
						changeOrigin: true,
						target: nconf.get('API_URL'),
					},
				},
			},
		}
	);

	const devserver = options.devserver;

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
				'webpack-dev-server/client?http://localhost:' + PORT,
				'react-hot-loader/patch'
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
		new HtmlWebpackPlugin({
			title: projectName,
			filename: path.resolve(options.projectDirName, 'public/index.html'),
			template: '!!ejs-loader!src/templates/index.ejs',
			inject: false,
			hash: true,
		}),
	];

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
				filename: path.resolve(options.projectDirName, 'public', 'build', 'index-dev.html'),
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

	return {
		devtool: false, //devserver ? 'cheap-module-eval-source-map' : false,
		entry: config.entry,
		output: config.output,
		context: context,
		resolve: {
			modules: [
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
			rules: [
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
					test: /(components|containers)*(js|jsx)$/,
					loaders: [
						'baggage-loader?index.sass',
					],
					include: [path.join(options.projectDirName, 'src')]
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
					loader: devserver ?
					        (
						        ['style-loader', 'css-loader', 'postcss-loader', 'resolve-url-loader', {
							        loader: 'sass-loader',
							        query: { sourceMap: true }
						        }]
					        ) :
					        (
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
			]
		},
		devServer: config.devServer
	};
};
