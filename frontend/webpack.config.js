var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: {
		auditor: path.resolve(__dirname, './js/auditor.jsx'),
		manager: path.resolve(__dirname, './js/manager.jsx'),
		client: path.resolve(__dirname, './client/client.jsx'),
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
		new ExtractTextPlugin("[name].css")
	]
};
