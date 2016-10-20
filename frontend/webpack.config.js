var path = require('path');

module.exports = {
	entry: {
		auditor: path.resolve(__dirname, './js/auditor.jsx'),
		manager: path.resolve(__dirname, './js/manager.jsx'),
	},
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name].bundle.js'
	},
	externals: {
	},
	module: {
		loaders: [
			/*
			{
				test: /\.jsx$/,
				exclude: /node_modules/,
				loader: 'jsx-loader'
			},*/
			{
				test: /\.js$|\.jsx$/,
				exclude: /(node_modules)/,
				loader: 'babel', // 'babel-loader' is also a valid name to reference
				query: {
					presets: ['es2015','react']
				}
			}
		]
	}
};
