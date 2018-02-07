'use strict';

import { Router } from 'express';
import { Ao3Request, FFNetRequest, RequestCache } from 'fic-request';

const route = new Router();
const cache = new RequestCache();


route.use( '/', ( req, res, next ) => {
	console.log( '/works', req.originalUrl );
	if( req.query.terms != null ) {
		req.query.terms = JSON.parse( req.query.terms );
	}
	next();
} );

route.get( '/:site/page/:page', ( req, res ) => {
	const { site, page } = req.params,
		{ terms } = req.query;

	let request_id = req.query.request_id,
		request = null;

	if( request_id != null ) {
		request = cache.get( request_id, terms );
	}
	if( request == null ) {
		if( site === 'ff' ) {
			request = new FFNetRequest( terms );
		} else if( site === 'ao3' ) {
			request = new Ao3Request( terms );
		} else {
			res.status( 400 ).json( { error: `Invalid site "${site}".` } );
			return;
		}
		request_id = cache.add( request );
	}

	request.page( page )
		.then( ( works ) => {
			res.status( 200 ).json( { request_id, works } );
		} )
		.catch( ( error ) => {
			console.error( error );
			res.status( 500 ).json( { error: error.message } );
		} );
} );


export default route;
