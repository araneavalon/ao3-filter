'use strict';

import { combineReducers } from 'redux';

import app from './app/reducer';
import filter from './filter/reducer';
import searches from './searches/reducer';
import tags from './tags/reducer';
import works from './works/reducer';

export default combineReducers( {
	app,
	filter,
	searches,
	tags,
	works,
} );
