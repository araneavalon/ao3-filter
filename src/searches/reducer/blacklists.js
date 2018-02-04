'use strict';

import _ from 'lodash';
import { updateState } from 'av/utils';

import {
	ADD_BLACKLIST,
	REMOVE_BLACKLIST
} from '../actions';


export const addBlacklist = ( bl, tag_id, search_id ) => {
	const isArray = Array.isArray( bl[ tag_id ] );
	if( isArray && !bl[ tag_id ].includes( search_id ) ) {
		return Object.assign( {}, bl, { [ tag_id ]: bl[ tag_id ].concat( search_id ) } );
	} else if( !isArray ) {
		return Object.assign( {}, bl, { [ tag_id ]: [ search_id ] } );
	}
	return bl;
};
export const removeBlacklist = ( bl, tag_id, search_id ) => {
	if( search_id == null ) {
		const search_id = tag_id;
		if( _.some( bl, ( a ) => a.includes( search_id ) ) ) {
			return _.mapValues( bl, ( a ) => a.filter( ( v ) => v !== search_id ) );
		}
	} else if( search_id != null && Array.isArray( bl[ tag_id ] ) && bl[ tag_id ].includes( search_id ) ) {
		return Object.assign( {}, bl, { [ tag_id ]: bl[ tag_id ].filter( ( v ) => v !== search_id ) } );
	}
	return bl;
};

export default ( state, action ) => {
	switch( action.type ) {
		case ADD_BLACKLIST:
			switch( action.status ) {
				case 'success':
					return updateState( state, {
						blacklists: addBlacklist( state.blacklists, action.tag_id, action.search_id )
					} )
				case 'error':
				default:
					return state;
			}
		case REMOVE_BLACKLIST:
			switch( action.status ) {
				case 'success':
					return updateState( state, {
						blacklists: removeBlacklist( state.blacklists, action.tag_id, action.search_id )
					} )
				case 'error':
				default:
					return state;
			}
		default:
			return state;
	}
}
