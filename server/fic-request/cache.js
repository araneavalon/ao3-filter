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

	add( r ) {
		const id = this.getId( r.terms );
		this.cache[ id ] = [ this.getTimestamp(), r ];
		return id;
	}
	get( id, t ) {
		this.validate();
		if( this.cache[ id ] ) {
			return this.cache[ id ][ 1 ];
		}
		if( t ) {
			const r = this.get( this.getId( t ) );
			if( r ) {
				return r;
			}
		}
		return null;
	}
}
