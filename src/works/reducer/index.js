'use strict';

const INITIAL_STATE = {
	byId: {},
	allIds: {},
	list: [],
	current: {
		work: null,
		chapter: null
	}
};


export default ( state = INITIAL_STATE, action ) => {
	switch( action.type ) {
		default:
			return state;
	}
}
