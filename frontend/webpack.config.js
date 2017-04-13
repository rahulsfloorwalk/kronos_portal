var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		auditor: path.resolve(__dirname, './js/auditor.jsx'),
		auditor_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router','react-ga'],

		manager: path.resolve(__dirname, './js/manager.jsx'),
		manager_vendor: ['jquery','react','react-dom','react-redux','redux','redux-thunk','redux-logger','react-router'],

		client: path.resolve(__dirname, './client/client.jsx'),
		client_vendor: ['jquery','react','react-dom','react-router'],

		'react-datetime': path.resolve(__dirname, './node_modules/react-datetime/css/react-datetime.css'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js'
	},
	externals: {
	},
	module: {
		loaders: [
			{
				test: /\.js$|\.jsx$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				query: {
					presets: [
						['env', {modules: false}],
						'react'
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
		new ExtractTextPlugin("[name].css")
	]
};
