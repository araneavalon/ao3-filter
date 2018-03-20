'use strict';

const debug = require( 'debug' )( 'fic-request-2:request' );
import _ from 'lodash';

import { Cache } from './cache';


export class Request {
	static QUERY_TIMEOUT = 30 * 60; // In seconds
	static MAX_TRIES = 3;
	static PAGE_SIZE = 25;

	constructor( sites, options = {} ) {
		this.queryTimeout = ( options.queryTimeout != null ) ? options.queryTimeout : Request.QUERY_TIMEOUT;
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

		this.queries = new Cache( { timeout: this.queryTimeout } );
		this.requests = new Cache();
	}

	getQueries( terms ) {
		const id = Cache.hash( terms ),
			cached = this.queries.get( id );
		debug( 'Getting queries: %s %s', id, !!cached );
		if( cached ) {
			return cached;
		}
		const queries = _.mapValues( this.sites, ( { getQuery } ) => getQuery( terms ) );
		this.queries.add( id, queries );
		return queries;
	}
	getRequest( terms, credentials = {} ) {
		const id = Cache.hash( terms, credentials ),
			cached = this.requests.get( id );
		debug( 'Getting request: %s %s', id, !!cached );
		if( cached ) {
			return cached;
		}
		const request = {
			cache: [],
			rawPages: _.map( this.sites, () => 1 ),
			buffers: _.map( this.sites, () => [] ),
			page: _.map( this.sites, ( { parseWorks }, key ) =>
				( { [ key ]: query }, page ) =>
					query.request( page, credentials[ key ] )
						.then( ( html ) => ( html != null ) ? parseWorks( html, credentials[ key ] ) : [] )
						.then( ( works ) => query.filter( works ) ) ),
		};
		this.requests.add( id, request );
		return request;
	}

	orderChunk( queries, { buffers, rawPages, page } ) {
		return Promise.all( buffers )
			.then( ( b ) => {
				debug( 'Getting buffers: %s', b.length );
				for( let i = 0; i < b.length; ++i ) {
					debug( 'Checking buffer: %s %s', i, b[ i ].length );
					if( b[ i ].length <= 0 ) {
						debug( 'Doing request: %s %s', i, rawPages[ i ] );
						buffers[ i ] = page[ i ]( queries, rawPages[ i ]++ );
					}
				}
				return Promise.all( buffers );
			} )
			.then( ( buffers ) => {
				debug( 'Draining buffers %o', buffers.map( ( b ) => b.length ) );
				const out = [];
				while( buffers.every( ( buffer ) => buffer.length > 0 ) ) {
					let max = 0;
					for( let i = 1; i < buffers.length; ++i ) {
						const a = buffers[ max ][ 0 ].updated,
							b = buffers[ i ][ 0 ].updated;
						debug( 'Comparing buffer heads: %s %s %s = %s', max, i, a, b );
						if( b > a ) {
							max = i;
						}
					}
					debug( 'Drained item: %s %s', max, buffers[ max ][ 0 ].updated );
					out.push( buffers[ max ].shift() );
				}
				return out;
			} );
	}
	fillCache( min, queries, request, tries = 0 ) {
		debug( 'Filling cache: (%s) %s >= %s', tries, request.cache.length, min );
		if( tries > this.maxTries ) {
			return Promise.reject( new Error( 'Max tries exceeded. Check your filter.' ) );
		}
		if( request.cache.length >= min ) {
			return Promise.resolve( request.cache );
		}
		return this.orderChunk( queries, request )
			.then( ( works ) => {
				request.cache = request.cache.concat( works );
				return works.length <= 0;
			} )
			.then( ( empty ) => this.fillCache( min, queries, request, empty ? ( tries + 1 ) : 0 ) );
	}

	page( page, terms, credentials = {} ) {
		const start = ( page - 1 ) * this.pageSize,
			end = page * this.pageSize;
		debug( 'Getting page: %s [%s,%s)', page, start, end );
		const queries = this.getQueries( terms ),
			request = this.getRequest( terms, credentials );
		return this.fillCache( end, queries, request )
			.then( ( cache ) => cache.slice( start, end ) );
	}
}
