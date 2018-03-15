'use strict';

import request from 'request-promise-native';


export class Request {
	static MAX_TRIES = 3;
	static PAGE_SIZE = 25;

	constructor( Query, Parser, terms, options = {} ) {
		this.terms = terms;

		this.options = options;
		this.queryOptions = ( options.queryOptions != null ) ? options.queryOptions : {};
		this.maxTries = ( options.maxTries != null ) ? options.maxTries : Request.MAX_TRIES;
		this.pageSize = ( options.pageSize != null ) ? options.pageSize : Request.PAGE_SIZE;

		this.Query = new Query( this.terms, this.queryOptions );
		this.Parser = Parser;

		this.rawPage = 1;
		this.cache = [];
	}

	request( page = 1 ) {
		const opts = this.Query.page( page );
		console.log( this.constructor.name, opts.qs );
		return request( opts )
			.then( ( body ) => this.Parser.works( body ) );
	}

	clearCache() {
		this.rawPage = 1;
		this.cache = [];
	}
	fillCache( min, tries = 0 ) {
		if( this.cache.length >= min ) {
			return Promise.resolve( this.cache );
		}
		if( tries >= this.maxTries ) {
			return Promise.reject( new Error( 'Max tries exceeded. Check filter.' ) );
		}
		return this.request( this.rawPage++ )
			.then( ( works ) => this.Query.filter( works ) )
			.then( ( works ) => {
				this.cache = this.cache.concat( works );
				console.log( works.length, this.cache.length );
				return works.length <= 0;
			} )
			.then( ( none ) => this.fillCache( min, none ? ( tries + 1 ) : 0 ) );
	}

	page( page = 1 ) {
		const start = ( page - 1 ) * this.pageSize,
			end = page * this.pageSize;
		return this.fillCache( end ).then( ( cache ) => cache.slice( start, end ) );
	}
}
