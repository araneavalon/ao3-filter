'use strict';

import {
	SET_STATIC_FILTER,
} from '../actions';


const INITIAL_STATE = {};

export default ( name ) =>
	( state = INITIAL_STATE, action ) => {
		if( action.name !== name ) {
			return state;
		}
		switch( action.type ) {
			case SET_STATIC_FILTER:
				return { ...state, [ action.key ]: action.value };
			default:
				return state;
		}
	}
