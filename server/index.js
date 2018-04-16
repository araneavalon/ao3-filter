'use strict';

import 'av/lodash';

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'path';

import { db } from 'db';


const app = express();

app.get( '/', ( req, res ) => {
	res.redirect( '/index.html' );
} );
app.get( '/index.html', ( req, res ) => {
	res.sendFile( 'static/index.html', { root: path.resolve( __dirname, '../../' ) } );
} );

app.use( '/static', express.static( path.resolve( __dirname, '../../', 'static' ), { index: false } ) );
app.use( '/build', express.static( path.resolve( __dirname, '../../', 'build/src' ), { index: false } ) );

app.use( '/', cookieParser() );


import works from './works';
app.use( '/works', works );

import login from './login';
app.use( '/login', login );


import archive from './archive';
app.use( '/archive', archive );


// db will not need to be defferred anywhere else as long as it is not accessed
// out of turn
db.promise.then( () => {
	app.listen( '8000' );
	console.log( 'Listening on port 8000' );
} );
