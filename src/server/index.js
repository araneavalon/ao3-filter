'use strict';

import 'av/lodash';

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import { db } from 'db';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { ThemeProvider } from 'av/jss-theme';

import { htmlTemplate } from './html-template';

import theme from 'theme.json';
import routes from 'routes';

import { createStore } from 'store';
import { App } from 'app';


const app = express();

app.use( '/build', express.static( path.resolve( __dirname, '../../', 'build/bundles' ), { index: false } ) );

app.use( '/', cookieParser() );

app.get( '/*', async ( req, res ) => {
	const context = {};
	const store = createStore();

	// store.dispatch( initializeSession() );

	const initialState = routes
		.map( ( route ) => {
			const match = matchPath( req.url, route ),
				getInitialState = route.Component.getInitialState;
			if( match && getInitialState ) {
				return store.dispatch( getInitialState( match ) );
			}
			return null;
		} )
		.filter( ( p ) => p );

	await Promise.all( initialState );

	const jsx =
		<ThemeProvider theme={ theme }>
			<ReduxProvider store={ store }>
				<StaticRouter context={ context } location={ req.url }>
					<App />
				</StaticRouter>
			</ReduxProvider>
		</ThemeProvider>;

	res.writeHead( 200, { 'Content-Type': 'text/html' } );
	res.end( htmlTemplate( renderToString( jsx ), store.getState() ) );
} );


// db will not need to be defferred anywhere else as long as it is not accessed
// out of turn
db.promise.then( () => {
	app.listen( '8000' );
	console.log( 'Listening on port 8000' );
} );
