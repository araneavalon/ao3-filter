'use strict';

import debug from 'debug';
import _ from 'lodash';


export class Limiter {
	static GET_DELAY = () => 1000 + ( Math.random() * 2000 | 0 );

	constructor( name = 'default', options = {} ) {
		this.getDelay = ( options.getDelay != null ) ? options.getDelay : Limiter.GET_DELAY;

		this.head = Promise.resolve();
		this.group = 0;
		this.index = 0;

		this.debug = debug( `limiter:${name}` );
	}

	wrap( fn, i, max ) {
		const group = this.group,
			index = this.index++;
		let pass, fail;
		const promise = new Promise( ( _pass, _fail ) => ( pass = _pass, fail = _fail ) );
		const start = () => {
			this.debug( 'Starting %s/%s (%s, %s)', i, max, index, group );
			setTimeout( () =>
				fn().then( pass, fail ),
				this.getDelay() );
			return promise;
		};
		return [ start, promise ];
	}

	execute( fns ) {
		if( fns.length <= 0 ) {
			this.debug( 'Executing %s ()', fns.length );
			return Promise.resolve( [] );
		}
		const startingIndex = this.index;
		const [ starters, promises ] = _.unzip( fns.map( ( fn, i, a ) => this.wrap( fn, i, a.length - 1 ) ) );
		this.debug( 'Executing %s (%s, %s-%s)', fns.length, this.group++, startingIndex, this.index - 1 );
		if( starters.length > 0 ) {
			this.head = starters.reduce(
				( p, start ) => p.then( () => start() ),
				this.head );
		}
		return Promise.all( promises );
	}
}
