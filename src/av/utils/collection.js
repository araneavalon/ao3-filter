'use strict';

import _ from 'lodash';


export const mapAny = ( collection, fn ) =>
	_.isArrayLike( collection ) ?
		_.map( collection, fn ) :
		_.mapValues( collection, fn );
