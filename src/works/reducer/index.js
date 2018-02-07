'use strict';

import {
	GET_WORKS_REQUEST,
	GET_WORKS_RESPONSE,
} from '../actions';


const INITIAL_STATE = {
	request_id: null,
	page: 1,
	list: [],
	loading: false,
	current: {
		work: null,
		chapter: null
	}
};

export default ( state = INITIAL_STATE, action ) => {
	console.log( 'works reducer', action );
	switch( action.type ) {
		case GET_WORKS_REQUEST:
			return Object.assign( {}, state, { page: action.page, request_id: action.request_id, loading: true, list: [] } );
		case GET_WORKS_RESPONSE:
			return Object.assign( {}, state, { page: action.page, request_id: action.request_id, loading: false, list: action.works } );
		default:
			return state;
	}
}
