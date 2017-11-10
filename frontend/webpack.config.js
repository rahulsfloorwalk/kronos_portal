var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
	entry: {
		auditor: path.resolve(__dirname, './js/auditor.jsx'),
		auditor_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-ga','react-facebook-login'],

		manager: path.resolve(__dirname, './js/manager.jsx'),
		manager_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-s-alert'],

		client: path.resolve(__dirname, './client/client.jsx'),
		client_vendor: ['jquery','react','react-dom','react-router','recharts'],

		report_print: path.resolve(__dirname, './client/report_print.jsx'),
		report_print_vendor: ['jquery','react','react-dom','react-router'],

		moderator: path.resolve(__dirname, './js/moderator/moderator.jsx'),
		moderator_vendor: ['jquery','react','react-dom','react-router'],

		'react-datetime': path.resolve(__dirname, './node_modules/react-datetime/css/react-datetime.css'),
		'bs_overrides': path.resolve(__dirname, './css/bs_overrides.scss'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js',
		publicPath: '/static/dist/'
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
		}),
		new HtmlWebpackPlugin({
			title: 'Report Print',
			filename: 'client/report_print.html',
			chunks: ['report_print_vendor', 'report_print'],
			template: path.resolve(__dirname, './client/client.ejs'),
		}),
		new CopyWebpackPlugin([
			{ from: path.resolve(__dirname, './bsvendor'), to: 'bsvendor/' }
		])
	],
	devServer: {
		inline: true,
		publicPath: "/static/dist/",
		proxy: {
			'/': {
				target: "http://localhost:8000/",
			}
		}
	}
};
