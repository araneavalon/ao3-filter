'use strict';

import _ from 'lodash';


export const SET_STATIC_FILTER = `${__filename}:SET_STATIC_FILTER`;
export const setStaticFilter = ( name, key, value ) =>
	( { type: SET_STATIC_FILTER, name, key, value } );

export const SET_TERMS = `${__filename}:SET_TERMS`;
export const setTerms = ( filter ) => {
	const terms = [];

	for( const t in filter ) {
		if( _.isObject( filter[ t ] ) ) {
			// TODO FINISH YO
		}
	}

	return { type: SET_TERMS, terms };
};
