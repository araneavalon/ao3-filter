'use strict';

import {
	SET_TERMS,
} from '../actions';


const INITIAL_STATE = [];

export default ( state = INITIAL_STATE, action ) => {
	switch( action.type ) {
		case SET_TERMS:
			return action.terms;
		default:
			return state;
	}
}
