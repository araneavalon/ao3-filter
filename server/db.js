'use strict';

import Loki from 'lokijs';

Loki.promise = function( filename, options = {} ) {
	return new Promise( ( pass, fail ) => {
		const db = new Loki( filename, {
			...options,
			autoload: true,
			autoloadCallback: ( error ) =>
				error ? fail( error ) : pass( db )
		} );
		db.saveDatabase = () => {
			return new Promise( ( pass, fail ) =>
				Loki.prototype.saveDatabase.call( db, ( error ) =>
					error ? fail( error ) : pass() ) );
		};
		db.addOrUpdateCollection = ( name, options, fn ) => {
			const o = db.getCollection( name );
			let items = null;
			if( o != null ) {
				items = o.find();
				for( let i = 0; i < items.length; ++i ) {
					delete items[ i ][ '$loki' ];
					delete items[ i ].meta;
				}
				db.removeCollection( name );
			}
			const n = db.addCollection( name, options );
			if( items != null && items.length > 0 ) {
				n.insert( ( fn != null ) ? items.map( fn ) : items );
			}
			return n;
		};
	} );
};


const db = Loki.promise( 'database.db', {
	autosave: true,
	autosaveInterval: 4000,
} );


let _api = null;
export function getDatabase() {
	if( !_api ) {
		_api = {
			saveDatabase: db.saveDatabase,

			works: db.getCollection( 'works' ),
			qsCache: db.getCollection( 'qsCache' ),
			authors: db.getCollection( 'authors' ),
			tags: db.getCollection( 'tags' ),
		};
	}
	return _api;
}

export function createDatabase() {
	return db.then( ( db ) => {
		db.addOrUpdateCollection( 'works', {
			clone: true,
			unique: [ 'ff-id', 'ao3-id' ],
		} );
		db.addOrUpdateCollection( 'qsCache', {
			clone: true,
			unique: [ 'hash' ],
		} );
		db.addOrUpdateCollection( 'authors', {
			clone: true,
			unique: [ 'ff-name', 'ao3-name' ],
		} );
		db.addOrUpdateCollection( 'tags', {
			clone: true,
			unique: [ 'ff-id', 'ao3-id' ],
		} );
	} );
}
