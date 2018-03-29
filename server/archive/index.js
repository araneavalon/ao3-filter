'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import { FFScraper } from './scrape';

const ARCHIVE_DIR = 'data/archived/';
const ALLOWED_ORIGINS = [
	'https://archiveofourown.org',
	'https://www.fanfiction.net',
	'https://m.fanfiction.net'
];

const route = new Router();


route.use( '/', ( req, res, next ) => {
	const origin = req.header( 'Origin' );
	if( ALLOWED_ORIGINS.includes( origin ) ) {
		res.header( 'Access-Control-Allow-Origin', origin );
		res.header( 'Access-Control-Allow-Headers', 'Content-Type, X-Requested-With' );
	}
	next();
} );
route.use( '/', bodyParser.json() );

route.post( '/ff', ( req, res ) => {
	const { id, title, header, chapters } = req.body;
	( new FFScraper( id, title, { archiveDir: ARCHIVE_DIR } ) )
		.getChapters( header, chapters )
		.catch( ( e ) => console.error( e ) );
	res.status( 200 ).send( [
		header && 'Attempting to archive header.',
		`Attempting to archive ${chapters.length} chapters.`
	].filter( ( s ) => s ).join( '\n' ) );
} );
route.post( '/ao3', ( req, res ) => {
	res.status( 200 ).send( 'ok' );
} );


export default route;
