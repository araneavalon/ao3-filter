'use strict';

import PropTypes from 'prop-types';

export const INITIAL_STATE = {
	byId: {},
	allIds: [],
	blacklists: {
		null: []
	},
	selected: null,
	errors: []
};

const search = PropTypes.shape( {
	id: PropTypes.number.isRequired,
	name: PropTypes.string.isRequired,
	tags: PropTypes.arrayOf( PropTypes.number.isRequired ).isRequired,
	filters: PropTypes.objectOf( PropTypes.bool ).isRequired
} );
export const Types = {
	search,
	searches: PropTypes.arrayOf( search.isRequired ),
	blacklists: PropTypes.objectOf( PropTypes.arrayOf( PropTypes.number.isRequired ).isRequired ),
	requests: PropTypes.arrayOf( PropTypes.number.isRequired ),
	errors: PropTypes.arrayOf( PropTypes.shape( {
		id: PropTypes.number.isRequired,
		error: PropTypes.string.isRequired
	} ).isRequired )
};
