'use strict';

const path = require( 'path' );


module.exports = {
	context: __dirname,
	mode: 'development',
	devtool: 'inline-source-maps',

	optimization: {
		minimize: false,
		splitChunks: {
			cacheGroups: {
				commons: {
					test: /\/node_modules\//,
					name: 'vendor',
					chunks: 'all',
				},
			},
		},
	},

	entry: {
		app: [
			'webpack-dev-server/client?http://localhost:8080',
			path.resolve( __dirname, './src/client/index.js' ),
		],
	},
	module: {
		rules: [ {
			include: path.resolve( __dirname, './src' ),
			use: [ 'babel-loader' ],
			test: /\.js$/,
		} ],
	},
	output: {
		path: path.resolve( __dirname, './public/js' ),
		filename: '[name].js',
    publicPath: 'http://localhost:8080/js/',
	},
};
