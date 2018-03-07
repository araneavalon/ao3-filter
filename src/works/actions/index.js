'use strict';

import * as fetch from 'av/fetch';


const TERMS = [].concat(
	[	'Adam_Irons',
		'AlolanCharmander',
		'AzureGigacyber',
		'Damien_Kova',
		'doomzoom',
		'Fallen_Shadow69',
		'Fallen Shadow69',
		'FireGire96',
		'IndieCent',
		'Izissia',
		'Lucky-38',
		'ObsidianThorne',
		'RWBYRemnants',
		'VellanShadow',
		'WestOrEast'
	].map( ( author ) => ( { type: 'author', not: true, value: author } ) ),
	[
		{ type: 'title', not: true, value: 'The Great Overlord Ozpin' },
		{ type: 'title', not: true, value: 'Tormenter' },
		{ type: 'relationship', not: true, characters: [ 'Tyrian Callows' ] },
		{ type: 'tag', not: true, exact: true, name: 'Parent/Child Incest' },
		{ type: 'relationship', not: true, characters: [ 'Ruby Rose', 'Jaune Arc' ] },
		{ type: 'relationship', not: true, characters: [ 'Weiss Schnee', 'Jaune Arc' ] },
		{ type: 'relationship', not: true, id: 17359695 }, // Jaune Arc/Other(s)
		{ type: 'tag', not: true, exact: true, id: 25331, name: 'Cheating' },
	]
);

TERMS.push(
	{	type: 'rarepairs',
		relationships: [
			[ 'Ruby Rose', 'Weiss Schnee' ],
			[ 'Blake Belladonna', 'Yang Xiao Long' ],
			[ 'Jaune Arc', 'Pyrrha Nikos' ],
			[ 'Lie Ren', 'Nora Valkyrie' ],
			[ 'Qrow Branwen', 'Winter Schnee' ],
			[ 'Coco Adel', 'Velvet Scarlatina' ],
		]
	},
	{ type: 'relationship', characters: [ 'Ruby Rose' ] },
	{ type: 'relationship', not: true, characters: [ 'Jaune Arc' ] },
);




export const GET_WORKS_REQUEST = `${__filename}:GET_WORKS_REQUEST`;
export const GET_WORKS_RESPONSE = `${__filename}:GET_WORKS_RESPONSE`;
export const getWorks = ( page, request_id ) => ( dispatch ) => {
	dispatch( { type: GET_WORKS_REQUEST, request_id, page } );
	return fetch.get( `/works/all/page/${page}`, { request_id, terms: JSON.stringify( TERMS ) } )
		.then( ( response ) => response.json() )
		.then( ( { request_id, works } ) => {
			dispatch( { type: GET_WORKS_RESPONSE, request_id, page, works } );
		} )
		.catch( ( error ) => {
			console.error( error );
		} );
};
