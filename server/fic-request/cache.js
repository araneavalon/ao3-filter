'use strict';

// import uuid from 'uuid/v4';
import crypto from 'crypto';


export class RequestCache {
	static TIMEOUT = 10 * 60;

	constructor( options = {} ) {
		this.timeout = ( options.timeout != null ) ? options.timeout : RequestCache.TIMEOUT;

		this.cache = Object.create( null );
	}

	getId( terms ) {
		return crypto.createHash( 'md5' ).update( JSON.stringify( terms ) ).digest( 'hex' );
	}
	getTimestamp() {
		return Date.now() / 1000 | 0;
	}

	validate() {
		const now = this.getTimestamp();
		for( const id in Object.keys( this.cache ) ) {
			if( this.cache[ id ] ) {
				const [ ts ] = this.cache[ id ];
				if( ( now - ts ) > this.timeout ) {
					delete this.cache[ id ];
				}
			}
		}
	}

	add( request ) {
		const id = this.getId( request.terms );
		this.cache[ id ] = [ this.getTimestamp(), request ];
		return id;
	}
	get( id, terms ) {
		this.validate();
		if( this.cache[ id ] ) {
			return this.cache[ id ][ 1 ];
		}
		if( terms ) {
			const request = this.get( this.getId( terms ) );
			if( request ) {
				return request;
			}
		}
		return null;
	}
}
