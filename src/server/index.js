'use strict';

import 'av/lodash';

// import path from 'path';

import express from 'express';
import cookieParser from 'cookie-parser';
import nunjucks from 'nunjucks';

import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter, matchPath } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { ThemeProvider } from 'av/jss-theme';
import { JssProvider, SheetsRegistry } from 'react-jss';

import theme from 'theme.json';
import routes from 'routes';

import { createStore } from 'store';
import { App } from 'app';


const app = express();
nunjucks.configure( 'src/server/views', {
	autoescape: true,
	express: app,
} );


// app.use( '/build', express.static( path.resolve( __dirname, '../../', 'build/bundles' ), { index: false } ) );

app.use( '/', cookieParser() );

app.get( '/*', async ( req, res ) => {
	const context = {};
	const css = new SheetsRegistry();
	const store = createStore();

	// await store.dispatch( initializeSession() );

	await Promise.all(
		routes
			.map( ( route ) => {
				const match = matchPath( req.url, route ),
					getInitialState = route.component.getInitialState;
				if( match && getInitialState ) {
					return store.dispatch( getInitialState( match ) );
				}
				return null;
			} )
			.filter( ( p ) => p ) );

	const jsx =
		<JssProvider registry={ css }>
			<ThemeProvider theme={ theme }>
				<ReduxProvider store={ store }>
					<StaticRouter context={ context } location={ req.url }>
						<App />
					</StaticRouter>
				</ReduxProvider>
			</ThemeProvider>
		</JssProvider>;

	res.render( 'index.njx', {
		dom: renderToString( jsx ),
		css: css.toString(),
		store: JSON.stringify( store.getState() ),
	} );
} );


app.listen( '8000' );
console.log( 'Listening on port 8000' );
