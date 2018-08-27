'use strict';

import { createStore as reduxCreateStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';


export function createStore( initialState ) {
	return reduxCreateStore( reducer, initialState, applyMiddleware( thunk ) );
}
