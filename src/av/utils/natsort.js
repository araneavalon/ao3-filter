'use strict';

import naturalCompare from 'natural-compare';


export const natsort = () => {
	let m = 1, c = ( e ) => e.toLowerCase(), k = ( e ) => e;
	const natsort = ( a, b ) => m * naturalCompare( c( k( a ) ), c( k( b ) ) );
	natsort.asc = () => {
		m = 1;
		return natsort;
	};
	natsort.desc = () => {
		m = -1;
		return natsort;
	};
	natsort.caseInsensitive = () => {
		c = ( e ) => e.toLowerCase();
		return natsort;
	};
	natsort.caseSensitive = () => {
		c = ( e ) => e;
		return natsort;
	}
	natsort.key = ( key ) => {
		if( key == null ) {
			k = ( e ) => e;
		} else {
			k = ( e ) => e[ key ];
		}
		return natsort;
	}
	return natsort;
};
