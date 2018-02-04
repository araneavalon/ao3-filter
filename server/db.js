'use strict';

import loki from 'lokijs';


export const database = Promise.resolve().then( () =>
	new Promise( ( pass, fail ) => {
		const db = new loki( 'database.db', {
			autosave: true,
			autosaveInterval: 4000,
			autoload: true,
			autoloadCallback: ( error ) =>
				error ? fail( error ) : pass( db )
		} );
	} )
).then( ( db ) => {
	if( !db.getCollection( 'tags' ) ) {
		db.addCollection( 'tags', {
			clone: true,
			unique: [ 'tag_id' ]
		} );
	}

	return db;
} ).then( ( db ) => ( {
	tags: db.getCollection( 'tags' )
} ) );

export function getDatabase() {
	return database;
}
