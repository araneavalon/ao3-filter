'use strict';

import PropTypes from 'prop-types';


export const INITIAL_STATE = {
	byId: {},
	allIds: {}
};

const tag = PropTypes.shape( {
	id: PropTypes.number.isRequired,
	types: PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired,
	name: PropTypes.string.isRequired
} );
export const Types = {
	tag,
	tagsById: PropTypes.objectOf( tag )
}

export default ( state = INITIAL_STATE, action ) => {
	switch( action.type ) {
		default:
			return state;
	}
}
