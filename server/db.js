'use strict';

import Loki from 'av/lokijs';


export const db = new Loki( 'database.db', [ 'works', 'qsCache', 'authors', 'tags' ], {
	autosave: true,
	autosaveInterval: 4000,
} );


export function createDatabase() {
	return db.proimse.then( ( db ) => {
		db.addOrUpdateCollection( 'qsCache', {
			clone: true,
			unique: [ 'hash' ],
		} );
		db.addOrUpdateCollection( 'works', {
			clone: true,
			unique: [ 'ff-id', 'ao3-id' ],
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
