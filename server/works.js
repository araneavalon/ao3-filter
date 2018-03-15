'use strict';

import { Router } from 'express';
import { Request } from 'fic-request-2';
import { Ao3Query, ao3Parser } from 'fic-request-2/ao3';
import { FFQuery, ffParser } from 'fic-request-2/ff';


const route = new Router();

const ao3 = { key: 'ao3', getQuery: Ao3Query.getQueryFactory(), parseWorks: ao3Parser.parseWorks };
const ff = { key: 'ff', getQuery: FFQuery.getQueryFactory(), parseWorks: ffParser.parseWorks };
const SITES = {
	all: new Request( [ ao3, ff ] ),
	ao3: new Request( [ ao3 ] ),
	ff: new Request( [ ff ] ),
};


route.use( '/', ( req, res, next ) => {
	if( req.query.terms != null ) {
		req.query.terms = JSON.parse( req.query.terms );
	}
	next();
} );

route.get( '/:site/page/:page', ( req, res ) => { // TODO REMOVE :site
	const { page, site } = req.params,
		{ terms } = req.query,
		credentials = { ao3: req.cookies[ 'ao3-session' ] };

	SITES[ site ].page( page, terms, credentials )
		.then( ( works ) => {
			res.status( 200 ).json( { works } );
		} )
		.catch( ( error ) => {
			console.error( error );
			res.status( 500 ).json( { error: error.message } );
		} );
} );


export default route;
