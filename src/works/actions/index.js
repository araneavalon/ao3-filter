'use strict';

import * as fetch from 'av/fetch';


const TERMS = [ {
	type: 'rarepairs',
	pairings: [
		[ 'Ruby R.', 'Weiss S.' ],
		[ 'Blake B.', 'Yang X.L.' ],
		[ 'Jaune A.', 'Pyrrha N.' ],
		[ 'Lie R.', 'Nora V.' ],
		[ 'Qrow B.', 'Winter S.' ],
		[ 'Coco A.', 'Velvet S.' ],
	]
} ];

export const GET_WORKS_REQUEST = `${__filename}:GET_WORKS_REQUEST`;
export const GET_WORKS_RESPONSE = `${__filename}:GET_WORKS_RESPONSE`;
export const getWorks = ( page, request_id ) => ( dispatch ) => {
	dispatch( { type: GET_WORKS_REQUEST, request_id, page } );
	return fetch.get( `/works/ff/page/${page}`, { request_id, terms: JSON.stringify( TERMS ) } )
		.then( ( response ) => response.json() )
		.then( ( { request_id, works } ) => {
			dispatch( { type: GET_WORKS_RESPONSE, request_id, page, works } );
		} )
		.catch( ( error ) => {
			console.error( error );
		} );
};
