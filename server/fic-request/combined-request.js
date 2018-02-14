'use strict';

import { Request } from './request';


export class CombinedRequest {
	static Requests = [];
	static addRequest( Request ) {
		if( !this.Requests.includes( Request ) ) {
			this.Requests.push( Request );
		}
	}

	constructor( terms, options = {} ) {
		this.terms = terms;

		this.maxTries = ( options.maxTries != null ) ? options.maxTries : Request.MAX_TRIES;
		this.pageSize = ( options.pageSize != null ) ? options.pageSize : Request.PAGE_SIZE;

		this.requests = CombinedRequest.Requests.map( ( Request ) => new Request( terms, options ) );
		this.rawPages = ( new Array( this.requests.length ) ).fill( 1 );
		this.buffers = ( new Array( this.requests.length ) ).fill( [] );
		this.cache = [];
	}

	clearCache() {
		this.requests.forEach( ( request ) => request.clearCache() );
		this.rawPages.fill( 1 );
		this.buffers.fill( [] );
		this.cache = [];
	}

	orderChunk() {
		return Promise.all( this.buffers ).then( ( buffers ) => {
			for( let i = 0; i < buffers.length; ++i ) {
				if( buffers[ i ].length <= 0 ) {
					this.buffers[ i ] = this.requests[ i ].page( this.rawPages[ i ]++ );
				}
			}
			return Promise.all( this.buffers );
		} ).then( ( buffers ) => {
			const out = [];
			while( buffers.every( ( buffer ) => buffer.length > 0 ) ) {
				let max = 0;
				for( let i = 1; i < buffers.length; ++i ) {
					const a = buffers[ max ][ 0 ].updated,
						b = buffers[ i ][ 0 ].updated;
					if( b > a ) {
						max = i;
					}
				}
				out.push( buffers[ max ].shift() );
			}
			return out;
		} );
	}
	fillCache( min ) {
		if( this.cache.length >= min ) {
			return Promise.resolve( this.cache );
		}
		return this.orderChunk()
			.then( ( works ) => this.cache = this.cache.concat( works ) )
			.then( () => this.fillCache( min ) );
	}

	page( page = 1 ) {
		const start = ( page - 1 ) * this.pageSize,
			end = page * this.pageSize;
		return this.fillCache( end ).then( ( cache ) => cache.slice( start, end ) );
	}
}
