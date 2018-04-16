'use strict';

import { db } from '../server/db';

// ff, ao3
const AUTHORS = [
	[ 'Fallen Shadow69', 'Fallen_Shadow69' ],
	[ 'Vena Sara', 'KryHeart_Ardy' ],
];

db.promise
	.then( ( db ) => {
		db.authors.findAndRemove( { name: { '$containsAny': AUTHORS.reduce( ( a, aa ) => a.concat( aa ), [] ) } } );
		db.authors.insert( AUTHORS.map( ( names ) => ( {
			names,
			'ff-name': names[ 0 ],
			'ao3-name': names[ 1 ],
		} ) ) );
		return db;
	} )
	.then( ( db ) => {
		console.log( JSON.stringify( db.authors.find(), null, 2 ) );
	} )
	.catch( ( error ) => {
		console.error( 'Database Action Error' );
		console.error( error );
	} )
	.then( () => db.promise )
	.then( ( db ) => db.saveDatabase() )
	.then( () => console.log( 'Database Saved Successfully' ) )
	.catch( ( error ) => {
		console.error( 'Database Save Error' );
		console.error( error );
	} );
