'use strict';

import express from 'express';
import path from 'path';

import { getDatabase } from 'db';


const app = express();

app.get( '/', ( req, res ) => {
	res.redirect( '/index.html' );
} );
app.get( '/index.html', ( req, res ) => {
	res.sendFile( 'static/index.html', { root: path.resolve( __dirname, '../../' ) } );
} );

app.use( '/static', express.static( path.resolve( __dirname, '../../', 'static' ), { index: false } ) );
app.use( '/build', express.static( path.resolve( __dirname, '../../', 'build/src' ), { index: false } ) );

app.use( '/', ( req, res, next ) =>
	getDatabase()
		.then( ( db ) => ( req.db = db ) )
		.then( () => next() )
		.catch( ( error ) => next( error ) ) );


import works from './works';
app.use( '/works', works );

import login from './login';
app.use( '/login', login );


app.listen( '8000' );
console.log( 'Listening on port 8000' );
