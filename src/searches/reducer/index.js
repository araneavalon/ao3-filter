'use strict';

import { flatCombineReducers } from 'av/utils';

import { INITIAL_STATE, Types } from './types';
export { INITIAL_STATE, Types };

import searchReducer from './searches';
import blacklistReducer from './blacklists';


export default flatCombineReducers( INITIAL_STATE, [
	searchReducer,
	blacklistReducer
] );
