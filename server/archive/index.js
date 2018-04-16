'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { FFScraper, Ao3Scraper } from './scrape';

const ARCHIVE_DIR = 'data/archived/';
const ALLOWED_ORIGINS = [
	'https://archiveofourown.org',
	'https://www.fanfiction.net',
	'https://m.fanfiction.net'
];

const route = new Router();

const getScraper = ( site, id, title, options ) => {
	switch( site ) {
		case 'ff': return new FFScraper( id, title, options );
		case 'ao3': return new Ao3Scraper( id, title, options );
		default: throw new Error( `Invalid Site: "${site}".` );
	}
};


route.use( '/', ( req, res, next ) => {
	const origin = req.header( 'Origin' );
	if( ALLOWED_ORIGINS.includes( origin ) ) {
		res.header( 'Access-Control-Allow-Origin', origin );
		res.header( 'Access-Control-Allow-Headers', 'Content-Type, X-Requested-With' );
	}
	next();
} );
route.use( '/', bodyParser.json() );

route.post( '/:site', ( req, res ) => {
	const { site } = req.params,
		{ id, title, header, chapters = [] } = req.body;
	getScraper( site, id, title, { archiveDir: ARCHIVE_DIR } )
		.getChapters( header, chapters )
		.catch( ( e ) => console.error( e ) );
	res.status( 200 ).send( [
		`Archiving from "${site}".`,
		header && 'Attempting to archive header.',
		`Attempting to archive ${chapters.length} chapters.`
	].filter( ( s ) => s ).join( '\n' ) );
} );


export default route;
