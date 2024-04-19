const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); //to access built-in plugins

module.exports = {
	entry: './src/index.ts',
	mode: 'development',
	devServer: {
		static: {
			directory: path.join(__dirname, 'public'),
		},
		compress: true,
		port: 4005,
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',	
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				include: path.resolve(__dirname, 'src/assets'),
				use: [
					'style-loader',
					'css-loader',
					'postcss-loader'

				]
			},
			{
				test: /\.html$/i,
				loader: "html-loader",
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js',
	},
	plugins: [new HtmlWebpackPlugin({ template: './src/public/index.html' })],
};
