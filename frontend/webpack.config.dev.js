/* global module:false */

const webpack = require("webpack");

const baseConfig = require("./webpack.config");

module.exports = Object.assign({}, baseConfig, {
	plugins : baseConfig.plugins.concat([
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("development")
			}
		}),
	])
});
