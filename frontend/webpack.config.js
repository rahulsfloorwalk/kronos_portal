/* global module:false __dirname:false */

const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");


module.exports = {
	entry: {
		"auditor/auditor": path.resolve(__dirname, "./js/auditor/index.jsx"),
		"agency/agency": path.resolve(__dirname, "./js/agency/index.jsx"),
		"manager/manager": path.resolve(__dirname, "./js/manager/index.jsx"),
		"client/client": path.resolve(__dirname, "./js/client/index.jsx"),
		"client/report_print": path.resolve(__dirname, "./js/client/report_print.jsx"),
		"moderator/moderator": path.resolve(__dirname, "./js/moderator/index.jsx"),
	},
	output: {
		path: path.resolve(__dirname, "./dist"),
		filename: "[name].bundle.js",
		publicPath: "/static/"
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /(node_modules)/,
				use: {
					loader: "babel-loader",
				},
			},
			{
				test: /\.(css|scss)$/,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"sass-loader",
				]
			},
			{
				test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf)$/,
				use: {
					loader: "file-loader",
				},
			},
			{
				test: /\.(html|ejs)$/,
				use: {
					loader: "html-loader",
					options: {
						attrs: ["img:src", "link:href"],
					},
				},
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename:"[name].[contenthash].css",
			chunkFilename: "[id].[contenthash].css",
		}),
		new HtmlWebpackPlugin({
			filename: "moderator/index.html",
			chunks: ["moderator/moderator"],
			template: path.resolve(__dirname, "./js/moderator/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			filename: "manager/index.html",
			chunks: [ "manager/manager"],
			template: path.resolve(__dirname, "./js/manager/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			filename: "auditor/index.html",
			chunks: [ "auditor/auditor"],
			template: path.resolve(__dirname, "./js/auditor/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			filename: "agency/index.html",
			chunks: [ "agency/agency"],
			template: path.resolve(__dirname, "./js/agency/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			filename: "client/index.html",
			chunks: [ "client/client"],
			template: path.resolve(__dirname, "./js/client/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			filename: "client/report_print.html",
			chunks: [ "client/report_print"],
			template: path.resolve(__dirname, "./js/client/index.ejs"),
		}),
		new CopyWebpackPlugin([
			{ from: path.resolve(__dirname, "./heartbeat.html"), to: "./" },
		]),
		new webpack.DefinePlugin({
			PHOEBE_VERSION: JSON.stringify(require("./package.json").version),
		}),
	],
	optimization: {
		splitChunks: {
			chunks: "initial",
		},
	},
};
