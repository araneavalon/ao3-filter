'use strict';

import { combineReducers } from 'redux';

import staticFilter from './static';
import terms from './terms';


// const INITIAL_STATE = {
// 	character: [],
// 	relationship: [],
// 	tag: [],
// };

export default combineReducers( {
	rating: staticFilter( 'rating' ),
	warning: staticFilter( 'warning' ),
	category: staticFilter( 'category' ),
	status: staticFilter( 'status' ),
	terms,
} );
