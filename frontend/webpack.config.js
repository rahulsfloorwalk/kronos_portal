var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	entry: {
		'auditor/auditor': path.resolve(__dirname, './js/auditor.jsx'),
		'auditor/auditor_vendor': ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-ga','react-facebook-login'],

		'manager/manager': path.resolve(__dirname, './js/manager.jsx'),
		'manager/manager_vendor': ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-s-alert'],

		'client/client': path.resolve(__dirname, './client/client.jsx'),
		'client/client_vendor': ['jquery','react','react-dom','react-router','recharts'],

		'client/report_print': path.resolve(__dirname, './client/report_print.jsx'),
		'client/report_print_vendor': ['jquery','react','react-dom','react-router'],

		'moderator/moderator': path.resolve(__dirname, './js/moderator/moderator.jsx'),
		'moderator/moderator_vendor': ['jquery','react','react-dom','react-router'],

		'css/react-datetime': path.resolve(__dirname, './node_modules/react-datetime/css/react-datetime.css'),
		'css/bs_overrides': path.resolve(__dirname, './css/bs_overrides.scss'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js',
		publicPath: '/static/'
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
						['syntax-dynamic-import'],
					]
				}
			},
			{
				test: /\.css$/,
				loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader"})
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract({ fallback: "style-loader", use: "css-loader!sass-loader"}),
			},
		]
	},
	plugins: [
		new webpack.optimize.CommonsChunkPlugin({ name: "auditor/auditor_vendor", chunks: ['auditor/auditor']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "client/client_vendor", chunks: ['client/client']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "manager/manager_vendor", chunks: ['manager/manager']}),
		new webpack.optimize.CommonsChunkPlugin({ name: "moderator/moderator_vendor", chunks: ['moderator/moderator']}),
		new ExtractTextPlugin("[name].css"),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Moderator Portal',
			filename: 'moderator/index.html',
			chunks: ['moderator/moderator_vendor', 'moderator/moderator', 'css/react-datetime', 'css/bs_overrides'],
			template: path.resolve(__dirname, './js/moderator/moderator.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Manager Portal',
			filename: 'manager/index.html',
			chunks: ['manager/manager_vendor', 'manager/manager', 'css/react-datetime', 'css/bs_overrides'],
			template: path.resolve(__dirname, './js/manager/manager.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Auditor Portal',
			filename: 'auditor/index.html',
			chunks: ['auditor/auditor_vendor', 'auditor/auditor', 'css/react-datetime', 'css/bs_overrides'],
			template: path.resolve(__dirname, './js/auditor/auditor.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'FloorWalk Client Portal',
			filename: 'client/index.html',
			chunks: ['client/client_vendor', 'client/client', 'css/react-datetime', 'css/bs_overrides'],
			template: path.resolve(__dirname, './client/client.ejs'),
		}),
		new HtmlWebpackPlugin({
			title: 'Report Print',
			filename: 'client/report_print.html',
			chunks: ['client/report_print_vendor', 'client/report_print', 'css/react-datetime', 'css/bs_overrides'],
			template: path.resolve(__dirname, './client/client.ejs'),
		}),
		new CopyWebpackPlugin([
			{ from: path.resolve(__dirname, './bsvendor'), to: 'bsvendor/' },
			{ from: path.resolve(__dirname, './img'), to: 'img/' },
			{ from: path.resolve(__dirname, './heartbeat.html'), to: './' },
		])
	],
	devServer: {
		inline: true,
		publicPath: "/static/",
		proxy: {
			'/': {
				target: "http://localhost:8000/",
			}
		}
	}
};
