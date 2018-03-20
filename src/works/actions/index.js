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
		'SergeantLawson',
		'VellanShadow',
		'WestOrEast'
	].map( ( author ) => ( { type: 'author', not: true, value: author } ) ),
	[
		{ type: 'series', not: true, id: 926118 },
		{ type: 'id', not: true, ao3: 12531572 },
		{ type: 'id', not: true, ao3: 10435569 },
		{ type: 'relationship', not: true, characters: [ 'Tyrian Callows' ] },
		{ type: 'freeform', not: true, exact: true, name: 'Parent/Child Incest' },
		{ type: 'relationship', not: true, characters: [ 'Ruby Rose', 'Jaune Arc' ] },
		{ type: 'relationship', not: true, characters: [ 'Weiss Schnee', 'Jaune Arc' ] },
		{ type: 'relationship', not: true, exact: true, id: 17359695 }, // Jaune Arc/Other(s)
		{ type: 'freeform', not: true, exact: true, id: 25331, name: 'Cheating' },
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
	// { type: 'relationship', characters: [ 'Ruby Rose' ] },
	{ type: 'relationship', not: true, characters: [ 'Jaune Arc' ] },
);




export const GET_WORKS_REQUEST = `${__filename}:GET_WORKS_REQUEST`;
export const GET_WORKS_RESPONSE = `${__filename}:GET_WORKS_RESPONSE`;
export const getWorks = ( page, terms ) => ( dispatch ) => {
	dispatch( { type: GET_WORKS_REQUEST, page } );
	return fetch.get( `/works/all/page/${page}`, { terms: JSON.stringify( terms ) }, { credentials: 'same-origin' } )
		.then( ( response ) => response.json() )
		.then( ( { works } ) => {
			dispatch( { type: GET_WORKS_RESPONSE, page, works } );
		} )
		.catch( ( error ) => {
			console.error( error );
		} );
};
