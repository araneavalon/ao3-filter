'use strict';

import { asyncActionCreator } from 'av/utils';
// import db, { ID_KEY } from 'local-db';


export const DEFAULT_SEARCH = {
	name: 'New Search',
	tags: [],
	filters: {}
};

export const ADD_SEARCH = `${__filename}:ADD_SEARCH`;
export const addSearch = asyncActionCreator( function* ( dispatch, search = DEFAULT_SEARCH ) {
	yield dispatch( { type: ADD_SEARCH } );
	yield ( search === DEFAULT_SEARCH ?
		db.then( ( db ) => db.searches.insert( search ) ) :
		Promise.resolve( search )
	).then( ( search ) =>
		dispatch( { type: ADD_SEARCH, status: 'success', search: { ...search, id: search[ ID_KEY ] } } )
	).catch( ( error ) =>
		dispatch( { type: ADD_SEARCH, status: 'error', error } )
	);
} );

export const UPDATE_SEARCH = `${__filename}:UPDATE_SEARCH`;
export const updateSearch = ( id, search ) => {

};

export const DELETE_SEARCH = `${__filename}:DELETE_SEARCH`;
export const deleteSearch = ( id ) => {

};

export const SELECT_SEARCH = `${__filename}:SELECT_SEARCH`;
export const selectSearch = ( id ) => ( { type: SELECT_SEARCH, id } );
