'use strict';

import { asyncActionCreator } from 'av/utils';
import db from 'local-db';

import { addSearch } from './search';
import { addBlacklist } from './blacklist';


export const LOAD_SEARCHES = `${__filename}:LOAD_SEARCHES`;
export const loadSearches = asyncActionCreator( function* ( dispatch ) {
	yield dispatch( { type: LOAD_SEARCHES, status: 'request' } );
	yield db.yieldAll( function* ( db ) {
		const searches = db.searches.find();
		for( const row of searches ) {
			yield dispatch( addSearch( row ) );
		}

		const blacklists = db.blacklists.find();
		for( const { tag_id, search_id } of blacklists ) {
			yield dispatch( addBlacklist( tag_id, search_id ) );
		}
	} );
} );
