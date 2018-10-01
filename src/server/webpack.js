'use strict';

import WebpackDevServer from 'webpack-dev-server';
import webpack from 'webpack';

import config from '../../webpack.dev.js';

const server = new WebpackDevServer( webpack( config ), {
	publicPath: config.output.publicPath,
	hot: false,
	stats: { colors: true },
} );

server.listen( 8080, 'localhost', () => {} );
