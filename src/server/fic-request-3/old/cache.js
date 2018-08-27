'use strict';

import crypto from 'crypto';


export class Cache {
	static TIMEOUT = 10 * 60; // In seconds

	static hash( ...args ) {
		const hash = crypto.createHash( 'md5' );
		for( const arg of args ) {
			hash.update( ( typeof arg === 'object' && arg != null ) ?
				JSON.stringify( arg ) : String( arg ) );
		}
		return hash.digest( 'hex' );
	}

	constructor( options = {} ) {
		this.timeout = ( options.timeout != null ) ? options.timeout : Cache.TIMEOUT;

		this.cache = Object.create( null );
	}

	getTimestamp() {
		return Date.now() / 1000 | 0;
	}
	validate() {
		if( this.timeout === 0 ) {
			return;
		}
		const now = this.getTimestamp();
		for( const id of Object.keys( this.cache ) ) {
			if( this.cache[ id ] ) {
				const [ ts ] = this.cache[ id ];
				if( ( now - ts ) > this.timeout ) {
					this._remove( id );
				}
			}
		}
	}

	_remove( id ) {
		if( this.cache[ id ] ) {
			delete this.cache[ id ];
		}
	}
	_get( id ) {
		if( this.cache[ id ] ) {
			return this.cache[ id ][ 1 ];
		}
		return null;
	}

	add( id, value ) {
		this.validate();
		const old = this._get( id );
		if( old ) {
			throw new Error( `Cache.add: Duplicate value with id "${id}".` );
		}
		this.cache[ id ] = [ this.getTimestamp(), value ];
	}
	remove( id ) {
		this.validate();
		this._remove( id );
	}
	get( id ) {
		this.validate();
		return this._get( id );
	}
}
