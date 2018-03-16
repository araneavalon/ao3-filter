'use strict';

import {
	GET_WORKS_REQUEST,
	GET_WORKS_RESPONSE,
} from '../actions';


const INITIAL_STATE = {
	page: 1,
	list: [],
	loading: false,
};

export default ( state = INITIAL_STATE, action ) => {
	switch( action.type ) {
		case GET_WORKS_REQUEST:
			return Object.assign( {}, state, { page: action.page, loading: true, list: [] } );
		case GET_WORKS_RESPONSE:
			return Object.assign( {}, state, { page: action.page, loading: false, list: action.works } );
		default:
			return state;
	}
}
