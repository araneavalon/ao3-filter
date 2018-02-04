'use strict';

import _ from 'lodash';
import { updateState } from 'av/utils';

import {
	ADD_SEARCH,
	UPDATE_SEARCH,
	DELETE_SEARCH,
	SELECT_SEARCH
} from '../actions';

import { removeBlacklist } from './blacklists';


export const addSearch = ( { byId, allIds }, search ) => {
	const out = {};
	if( !allIds.includes( search.id ) ) {
		out.allIds = allIds.concat( search.id );
	}
	if( !_.isEqual( byId[ search.id ], search ) ) {
		out.byId = Object.assign( {}, byId, { [ search.id ]: search } );
	}
	return out;
};
export const updateSearch = ( { byId, allIds }, search ) => {
	if( !allIds.includes( search.id ) || byId[ search.id ] == null ) {
		return addSearch( { byId, allIds }, search.id, search );
	} else if( !_.isEqual( byId[ search.id ], search ) ) {
		return { byId: Object.assign( {}, byId, { [ search.id ]: search } ) };
	}
	return null;
};
export const deleteSearch = ( { byId, allIds, blacklists }, id ) => {
	const out = {};
	if( allIds.includes( id ) ) {
		out.allIds = allIds.filter( ( v ) => v !== id );
	}
	if( byId[ id ] != null ) {
		out.byId = _.pickBy( byId, ( v ) => v !== id );
	}
	if( _.some( blacklists, ( a ) => a.includes( id ) ) ) {
		out.blacklists = removeBlacklist( blacklists, id )
	}
	return out;
};

export default ( state, action ) => {
	switch( action.type ) {
		case ADD_SEARCH:
			switch( action.status ) {
				case 'success':
					return updateState( state, addSearch( state, action.search ) );
				case 'error':
				default:
					return state;
			}
		case UPDATE_SEARCH:
			switch( action.status ) {
				case 'success':
					return updateState( state, updateSearch( state, action.search ) );
				case 'error':
				default:
					return state;
			}
		case DELETE_SEARCH:
			switch( action.status ) {
				case 'success':
					return updateState( state, deleteSearch( state, action.id ) );
				case 'error':
				default:
					return state;
			}
		case SELECT_SEARCH:
			return updateState( state, { selected: action.id } );
		default:
			return state;
	}
}
