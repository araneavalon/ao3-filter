'use strict';

import { db } from '../server/db';

import CHARACTERS from './tags-ff-rwby.json';

db.promise
	.then( ( db ) => {
		db.tags.findAndRemove( { 'ff-id': { '$in': CHARACTERS.map( ( tag ) => tag[ 'ff-id' ] ) } } );
		db.tags.insert( CHARACTERS.map( ( tag ) => ( {
			type: 'character',
			'ff-id': tag[ 'ff-id' ],
			'ao3-name': tag.canonical,
			'ff-name': tag.name,
			name: tag.display || tag.canonical || tag.name,
			expand: tag.expand,
		} ) ) );
		return db;
	} )
	.then( ( db ) => {
		console.log( JSON.stringify( db.tags.find(), null, 2 ) );
	} )
	.then( () => db.promise )
	.then( ( db ) => db.saveDatabase() )
	.then( () => console.log( 'Database Saved Successfully' ) )
	.catch( ( error ) => {
		console.error( error );
	} )
