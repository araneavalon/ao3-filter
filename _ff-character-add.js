'use strict';

import { getDatabase } from './server/db';

import CHARACTERS from './server/fic-request-2/ff/tags-ff-rwby.json';

getDatabase()
	.then( ( db ) => {
		db.tags.findAndRemove( { 'ff-id': { '$in': CHARACTERS.map( ( tag ) => tag[ 'ff-id' ] ) } } );
		db.tags.insert( CHARACTERS.map( ( tag ) => ( {
			'ff-id': tag[ 'ff-id' ],
			'ao3-name': tag.canonical,
			'ff-name': tag.name,
			name: tag.display || tag.canonical || tag.name,
			expand: tag.expand,
		} ) ) );
		// db.tags.findAndUpdate( { 'ff-id': { $in: CHARACTERS.map( ( tag ) => tag[ 'ff-id' ] ) } }, ( tag ) => {
		// 	tag.type = 'character';
		// } );
		return db;
	} )
	.then( ( db ) => {
		console.log( JSON.stringify( db.tags.find(), null, 2 ) );
	} )
	.then( () => getDatabase() )
	.then( ( db ) => db.saveDatabase() )
	.then( () => console.log( 'Database Saved Successfully' ) )
	.catch( ( error ) => {
		console.error( error );
	} )
