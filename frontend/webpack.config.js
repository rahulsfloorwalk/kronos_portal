var path = require('path');

module.exports = {
	entry: path.resolve(__dirname, './js/index.jsx'),
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: 'bundle.js'
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
