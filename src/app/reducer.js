'use strict';

import PropTypes from 'prop-types';
import { makeReducer } from 'av/utils';

import { SET_PAGE } from './actions';


export const INITIAL_STATE = {
	// page: 'works' TODO
	page: 'searches'
};

export const Types = {
	page: PropTypes.oneOf( [ 'works', 'searches' ] )
};

export default makeReducer(
	INITIAL_STATE,
	SET_PAGE, ( state, { page } ) => ( { ...state, page } )
);
