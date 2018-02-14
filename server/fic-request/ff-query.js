'use strict';

import _ from 'lodash';
import { Query } from './query';


// TODO Add qs filtering, when available.
export class FFQuery extends Query {
	parseTitle( { not, value } ) {
		return ( work ) => not( work.title === value );
	}
	parseAuthor( { not, value } ) {
		// ff works can only have one author.
		return ( work ) => not( work.authors[ 0 ][ 0 ] === value );
	}
	parseRating( { not, value } ) {
		return ( work ) => not( work.rating === value );
	}
	parseComplete( { not } ) {
		return ( work ) => not( work.chapters[ 0 ] === work.chapters[ 1 ] );
	}

	parseRelationship( { not, exact, characters } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
	}
	parseCharacter( { not, name } ) {
		// ff works can not have discrepencies between relationship characters and the character list.
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'character' )
			.find( ( { name: n } ) => n === name ) != null );
	}

	parseRarepairs( { not, pairings } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				pairings.find( ( p ) => _.xor( c, p ).length <= 0 ) == null ) );
	}

	page( page ) {
		return {
			method: 'GET',
			uri: 'https://www.fanfiction.net/anime/RWBY/',
			qs: { p: page, srt: 1, lan: 1, r: 10, _c1: 107779, _c2: 107390 }, // TODO
		};
	}
}
