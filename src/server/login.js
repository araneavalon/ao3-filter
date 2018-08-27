'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { login as ao3Login } from 'ao3/login';

const route = new Router();


route.use( '/', bodyParser.urlencoded( { extended: false } ) );

route.post( '/ao3', ( req, res ) => {
	const { username, password } = req.body;
	ao3Login( username, password ).then( ( cookies ) => {
		res.cookie( 'ao3-session', JSON.stringify( cookies.map( ( { key, value } ) => ( { key, value } ) ) ) );
		res.status( 200 ).end();
	} )
} );


export default route;
