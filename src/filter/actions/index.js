'use strict';

import { getWorks } from 'works/actions';


export const SET_STATIC_FILTER = `${__filename}:SET_STATIC_FILTER`;
export const setStaticFilter = ( name, key, value ) =>
	( { type: SET_STATIC_FILTER, name, key, value } );

export const SET_TERMS = `${__filename}:SET_TERMS`;
export const submitFilter = ( filter ) => ( dispatch ) => {
	const terms = [];

	for( const t in filter ) {
		switch( t ) {
			case 'rating':
			case 'warning':
			case 'category':
				for( const k in filter[ t ] ) {
					const v = filter[ t ][ k ];
					if( v != null ) {
						terms.push( { type: t, name: k, not: !v, fuzzy: true } );
					}
				}
				break;
			case 'character':
			case 'relationship':
				break;
			case 'status':
				const v = filter[ t ].complete;
				if( v != null ) {
					terms.push( { type: 'complete', not: !v } );
				}
				break;
			default:
				console.warn( `Unknown filter type: "${t}"` );
		}
	}

	console.log( 'terms', terms, filter );
	dispatch( { type: SET_TERMS, terms } );
	dispatch( getWorks( 1, terms ) );
};
