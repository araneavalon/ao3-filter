'use strict';

import _ from 'lodash';
import { Query } from './query';


// TODO Add qs filtering, when available.
export class FFQuery extends Query {
	parseTitle( { not, value } ) {
		return ( work ) => not( work.title === value );
	}
	parseAuthor( { not, value } ) {
		return ( work ) => not( work.author[ 1 ] === value );
	}
	parseComplete( { not } ) {
		return ( not() != null ) ?
			( work ) => not( work.complete ) :
			null;
	}
	parsePairing( { not, exact, characters } ) {
		return ( work ) => not( work.pairings.some( ( c ) =>
			( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
	}
	parseCharacter( { not, name } ) {
		return ( work ) => not( work.characters.includes( name ) );
	}
	parseRarepairs( { not, pairings } ) {
		return ( work ) => not( work.pairings.some( ( w ) => pairings.find( ( p ) => _.xor( w, p ).length <= 0 ) == null ) );
	}

	page( page ) {
		return {
			method: 'GET',
			uri: 'https://www.fanfiction.net/anime/RWBY/',
			qs: { p: page, srt: 1, lan: 1, r: 10, _c1: 107779, _c2: 107390 }, // TODO
		};
	}
}
