'use strict';

import _ from 'lodash';


export * from './collection';
export { natsort } from './natsort';


export const makeReducer = ( INITIAL_STATE, ...args ) => {
	if( ( args.length % 2 ) !== 0 ) {
		throw new Error( 'Arguments to "makeReducer" must be specified in action(s), reducer pairs.' );
	}
	const spec = Object.create( null );
	for( let i = 0; i < args.length; i += 2 ) {
		const actions = _.isArray( args[ i ] ) ? args[ i ] : [ args[ i ] ],
			fn = args[ i + 1 ];
		for( const action of actions ) {
			if( spec[ action ] != null ) {
				throw new Error( 'There may be no duplicate actions in "makeReducer".' );
			}
			spec[ action ] = fn;
		}
	}
	return ( state = INITIAL_STATE, action ) => {
		if( spec[ action.type ] != null ) {
			return spec[ action.type ]( state, action )
		} else {
			return state;
		}
	};
};
export const flatCombineReducers = ( INITIAL_STATE, reducers ) =>
	( state = INITIAL_STATE, action ) => {
		for( const fn of reducers ) {
			const newState = fn( state, action );
			if( newState !== state ) {
				return newState;
			}
		}
		return state;
	};

export const updateState = ( state, update ) =>
	_.size( update ) > 0 && _.some( update, ( v, i ) => v !== state[ i ] ) ?
		_.assign( {}, state, update ) :
		state;

export const executeGenerator = ( g ) => {
	const out = [];
	for( const value of g ) {
		out.push( value );
	}
	return out;
};

export const promiseYieldAll =
	( gfn, ...args ) =>
		Promise.all( executeGenerator( _.isFunction( gfn ) ? gfn( ...args ) : gfn ) );

export const asyncActionCreator =
	( gfn ) =>
		( ...args ) =>
			( dispatch ) =>
				promiseYieldAll( gfn( dispatch, ...args ) );
