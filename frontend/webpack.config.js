var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	entry: {
		auditor: path.resolve(__dirname, './js/auditor.jsx'),
		auditor_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-ga'],

		manager: path.resolve(__dirname, './js/manager.jsx'),
		manager_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router'],

		client: path.resolve(__dirname, './client/client.jsx'),
		client_vendor: ['jquery','react','react-dom','react-router'],

		moderator: path.resolve(__dirname, './js/moderator/moderator.jsx'),
		moderator_vendor: ['jquery','react','react-dom','react-router'],

		'react-datetime': path.resolve(__dirname, './node_modules/react-datetime/css/react-datetime.css'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js'
	},
	externals: {
	},
	module: {
		rules: [
			{
				test: /\.js$|\.jsx$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				query: {
					presets: [
						['es2015', {modules: false}],
						'react'
					],
					plugins: [
						['transform-class-properties'],
					]
				}
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader"})
			},
		]
	},
	plugins: [
		//new webpack.DefinePlugin({
		//	"process.env": {
		//		NODE_ENV: JSON.stringify("production")
		//	}
		//}),
		new webpack.optimize.CommonsChunkPlugin({ name: "auditor_vendor", chunks: ['auditor']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "client_vendor", chunks: ['client']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "manager_vendor", chunks: ['manager']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "moderator_vendor", chunks: ['moderator']}),
		new ExtractTextPlugin("[name].css"),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Moderator Portal',
			filename: 'moderator/index.html',
			chunks: ['moderator_vendor', 'moderator'],
			template: path.resolve(__dirname, './js/moderator/moderator.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Manager Portal',
			filename: 'manager/index.html',
			chunks: ['manager_vendor', 'manager'],
			template: path.resolve(__dirname, './js/manager/manager.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Auditor Portal',
			filename: 'auditor/index.html',
			chunks: ['auditor_vendor', 'auditor'],
			template: path.resolve(__dirname, './js/auditor/auditor.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Client Portal',
			filename: 'client/index.html',
			chunks: ['client_vendor', 'client'],
			template: path.resolve(__dirname, './client/client.ejs'),
		})
	],
	devServer: {
		inline: true,
		publicPath: "/static/dist/",
		//contentBase: "/static/",
		proxy: {
			'/': {
				target: "http://localhost:8000/",
				bypass: function(req, res, proxyOptions) {
					if (req.originalUrl.startsWith('/static')) {
						if (req.originalUrl.indexOf('hot-update') !== -1 ) {
							var repr = req.originalUrl.replace('/static','/static/dist');
							console.log('Skipping proxy for ',req.originalUrl,' WEBPACK request to ', repr);
							return repr;
						} else {
							var repr = req.originalUrl.replace('/static','.');
							console.log('Skipping proxy for ',req.originalUrl,' NON-WEBPACK request to ', repr);
							return repr;
						}

					}
				}
			}
		}
	}
};
