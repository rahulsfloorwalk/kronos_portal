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
		"css/react-datetime": path.resolve(__dirname, "./node_modules/react-datetime/css/react-datetime.css"),
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
					options: {
						presets: [
							"@babel/preset-env",
							"@babel/preset-react"
						],
						plugins: [
							"babel-plugin-dynamic-import-node",
							"@babel/plugin-syntax-dynamic-import",
							"@babel/plugin-proposal-class-properties"
						],
					},
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
			filename:"[name].css",
			chunkFilename: "[id].css",
		}),
		new HtmlWebpackPlugin({
			title: "FloorWalk Moderator Portal",
			filename: "moderator/index.html",
			chunks: ["moderator/moderator", "css/react-datetime"],
			template: path.resolve(__dirname, "./js/moderator/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			title: "FloorWalk Manager Portal",
			filename: "manager/index.html",
			chunks: [ "manager/manager", "css/react-datetime"],
			template: path.resolve(__dirname, "./js/manager/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			title: "FloorWalk Auditor Portal",
			filename: "auditor/index.html",
			chunks: [ "auditor/auditor", "css/react-datetime"],
			template: path.resolve(__dirname, "./js/auditor/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			title: "FloorWalk Agency Portal",
			filename: "agency/index.html",
			chunks: [ "agency/agency", "css/react-datetime"],
			template: path.resolve(__dirname, "./js/agency/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			title: "FloorWalk Client Portal",
			filename: "client/index.html",
			chunks: [ "client/client", "css/react-datetime"],
			template: path.resolve(__dirname, "./js/client/index.ejs"),
		}),
		new HtmlWebpackPlugin({
			title: "Report Print",
			filename: "client/report_print.html",
			chunks: [ "client/report_print", "css/react-datetime"],
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
