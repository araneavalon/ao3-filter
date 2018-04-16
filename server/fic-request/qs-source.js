'use strict';

import _ from 'lodash';
import crypto from 'crypto';
import { db } from 'db';

import { Source } from './source';


export class QSSource extends Source {
	constructor( site, terms, credentials, options ) {
		super( terms, options );

		this.site = site;
		this.url = this.site.url;
		this.idKey = this.site.idKey;
		this.pageSize = this.site.pageSize;

		this.credentials = credentials;

		this.qs = null;
		this.cacheId = null;
	}

	getCacheId() {
		if( this.cacheId == null && this.qs != null ) {
			this.cacheId = [ this.site, this.credentials, this.qs ]
				.reduce( ( hash, v ) =>
					( v != null ) ? hash.update( JSON.stringify( v ) ) : hash,
					crypto.createHash( 'sha256' ) )
				.digest( 'hex' );
		}
		return this.cacheId;
	}

	getCachedWork( id ) {
		return db.works.findOne( { [ this.idKey ]: id } );
	}
	updateCachedWork( cachedWork, work ) {
		if( cachedWork == null ) {
			work[ this.idKey ] = work.id;
			db.works.insert( work );
		} else {
			Object.assign( cachedWork, work );
			db.works.update( cachedWork );
		}
	}

	getCachedPage( page ) {
		const cacheId = this.getCacheId(),
			result = db.qsCache.find( { hash: cacheId } );
		if( result.length > 1 ) {
			this.debug( `Warning: multiple qsCache entries for hash ${cacheId}` );
		}
		return _.get( result, '[0]', [] )
			.slice( this.pageSize * ( page - 1 ), this.pageSize * page );
	}

	async *requestPage( page ) {
		throw new Error( `${this.constructor.name}.*requestPage(${page}) not implemented.` );
	}

	async page( page ) {
		const cachedPage = this.getCachedPage( page );
		for await ( const work of this.requestPage( page ) ) {
			// TODO DO THIS CORRECTLY INSTEAD OF A MASSIVE FUCK UP
			if( work.id === cachedPage.shift() ) {
				const cachedWork = this.getCachedWork( work.id );
				if( cachedWork && cachedWork.updated === work.updated ) { // TODO CHECK TAGS, ETC
					break;
				}
				this.updateCachedWork( cachedWork, work );
			}
		}
	}
}
