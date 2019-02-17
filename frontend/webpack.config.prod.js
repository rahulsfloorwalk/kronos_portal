/* global module:false */

const webpack = require("webpack");

const baseConfig = require("./webpack.config");

module.exports = Object.assign({}, baseConfig, {
	output: Object.assign({}, baseConfig.output, {
		filename: "[name].[chunkhash].bundle.js",
	}),
	devtool: "source-map",
	plugins : baseConfig.plugins.concat([
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		}),
		new webpack.HashedModuleIdsPlugin(),
	])
});
