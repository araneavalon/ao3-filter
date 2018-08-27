'use strict';

const debug = require( 'debug' )( 'fic-request:request' );
import { db } from 'db';


export class Request {
	static MAX_TRIES = 3;
	static PAGE_SIZE = 25;

	constructor( sites, options = {} ) {
		this.maxTries = ( options.maxTries != null ) ? options.maxTries : Request.MAX_TRIES;
		this.pageSize = ( options.pageSize != null ) ? options.pageSize : Request.PAGE_SIZE;

		this.sites = Object.create( null );
		for( const { key, getQuery, parseWorks } of sites ) {
			if( this.sites[ key ] ) {
				throw new Error( `Request.constructor: Site key "${key}" must be unique.` );
			}
			this.sites[ key ] = { getQuery, parseWorks };
		}
		debug( 'Loaded sites: %j', Object.keys( this.sites ) );
	}

	work( site, id ) {
		return db.works.findOne( { [ `${site}-id` ]: id } );
	}
	page( terms, page ) {

	}
}
