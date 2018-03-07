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
	} );
};


export const database = Loki.promise( 'database.db', {
	autosave: true,
	autosaveInterval: 4000,
} ).then( ( db ) => ( {
	works: db.addCollection( 'works', {
		clone: true,
		unique: [ 'ao3_id', 'ff_id' ]
	} ),

	tags: db.addCollection( 'tags', {
		clone: true,
		unique: [ 'tag_id' ]
	} )
} ) );

export function getDatabase() {
	return database;
}
