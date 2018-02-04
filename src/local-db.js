'use strict';

import makeDatabase from 'av/local-db';

export const ID_KEY = '$loki';
export default makeDatabase( {
	filename: 'ao3+.db',
	options: {
		autosaveInterval: 4000
	},
	init: ( db ) => {
		if( !db.getCollection( 'searches' ) ) {
			db.addCollection( 'searches', {
				clone: true
			} );
		}

		if( !db.getCollection( 'blacklists' ) ) {
			db.addCollection( 'blacklists', {
				clone: true,
				indices: [ 'tag_id', 'search_id' ]
			} );
		}
	},
	api: ( db ) => ( {
		searches: db.getCollection( 'searches' ),
		blacklists: db.getCollection( 'blacklists' )
	} )
} );
