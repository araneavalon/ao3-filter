'use strict';

import gutil from 'gulp-util';
import through from 'through2';
import mergeStream from 'merge-stream';


const _callIfFunction = ( value ) => {
	if( typeof value === 'function' ) {
		return value();
	}
	return value;
}

export const avGulpUtil = {
	sequenceStreams( src, dest ) {
		const t = through.obj();

		let done = false;
		const next = ( error ) => {
			if( error ) {
				t.emit( 'error', error );
			} else if( !done ) {
				_callIfFunction( dest ).pipe( t );
			}
			done = true;
		};

		avGulpUtil.onEnd( _callIfFunction( src ), next );

		return t;
	},

	allStreams( streams ) {
		return mergeStream( ...streams );
	},

	onEnd( stream, cb ) {
		stream
			.on( 'data', () => {} )
			.on( 'error', cb )
			// Just to be really really sure that it will actually catch the end.
			.on( 'end', cb )
			.on( 'close', cb )
			.on( 'finish', cb );
	}
};

export default new Proxy( gutil, {
	ownKeys: ( target ) => {
		return Reflect.ownKeys( target ).concat( Reflect.ownKeys( avGulpUtil ) );
	},
	has: ( target, key ) => {
		return Reflect.has( avGulpUtil, key ) || Reflect.has( target, key );
	},
	get: ( target, key ) => {
		if( Reflect.has( avGulpUtil, key ) ) {
			return Reflect.get( avGulpUtil, key );
		}
		return Reflect.get( target, key );
	},
} );
