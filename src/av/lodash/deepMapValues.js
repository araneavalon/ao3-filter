'use strict';

import _ from 'lodash';


_.mixin( {
	deepMapValues: ( collection, iteratee ) => {
		const _increaseDepth = ( v ) =>
			( _.isObject( v ) || _.isArray( v ) ) ?
				_.deepMapValues( v, iteratee ) :
				v;
		if( _.isArray( collection ) ) {
			return collection.map( iteratee ).map( _increaseDepth );
		} else {
			return _.mapValues( _.mapValues( collection, iteratee ), _increaseDepth );
		}
	},
} );
