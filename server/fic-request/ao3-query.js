'use strict';

import _ from 'lodash';
import { Query } from './query';


export class Ao3Query extends Query {
	getTagKey( type ) {
		return ( type.length < 6 ) ?
			`${type.toLowerCase()}_ids` :
			'filter_ids';
	}

	parseTitle( { not, fuzzy, value } ) {
		if( !fuzzy && !not() ) {
			return { work_search: { title: value } };
		}
		return [
			{ work_search: { query: not( `"${value}"` ) } },
			fuzzy ? null : ( work ) => not( work.title === value )
		];
	}
	parseAuthor( { not, fuzzy, value } ) {
		if( !fuzzy && !not() ) {
			return { work_search: { creator: value } };
		}
		return [
			{ work_search: { query: not( `"${value}"` ) } },
			fuzzy ? null : ( work ) => not( work.author === value )
		];
	}
	parseComplete( { not } ) {
		if( not() === false ) {
			return { work_search: { complete: '1' } };
		} else if( not() === true ) {
			return ( work ) => work.chapters[ 0 ] !== work.chapters[ 1 ]
		}
		return undefined;
	}

	parseTag( { not, fuzzy, exact, type, id, name } ) {
		// 	TODO
		// 		Implement querystring filtering, when available.
		if( fuzzy ) {
			return { work_search: { query: not( `"${name}"` ) } };
		} else if( exact && type != null && id != null ) {
			return { work_search: { query: not( `${this.getTagKey( type )}:${id}` ) } };
		} else if( exact && name != null && !not() ) {
			return { work_search: { other_tag_name: [ name ] } };
		} else if( exact && name != null && not() ) {
			return ( work ) => not( work.tags.find( ( { type: t, name: n } ) => ( type == null || t === type ) && n === name ) != null );
		} else if( !exact && name != null ) {
			return ( work ) => not( work.tags.find( ( { type: t, name: n } ) => ( type == null || t === type ) && n.contains( name ) ) );
		}
		throw new Error( 'Attempted to filter a tag in a way that is not supported.' );
	}
	parseFandom( term ) {
		return this.parseTag( term );
	}
	parseWarning( term ) {
		return this.parseWarning( term );
	}
	parsePairing( { not, exact, characters } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement qs filtering when available.
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'pairing' )
			.some( ( { characters: c } ) =>
				( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
	}
	parseCharacter( { not, name } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement querystring filtering when available.
		return ( work ) => {
			const characters = [].concat(
				work.tags
					.filter( ( { type } ) => type === 'character' )
					.map( ( { name } ) => name ),
				work.tags
					.filter( ( { type } ) => type == 'pairing' )
					.reduce( ( o, { characters } ) => o.concat( characters ), [] )
			);
			return not( characters.includes( name ) );
		}
	}
	parseCharacter( { not, name } ) {
		return ( work ) => not( work.characters.includes( name ) );
	}
	parseFreeform( term ) {
		return this.parseTag( term );
	}

	parseRarepairs( { not, pairings } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'pairing' )
			.some( ( { characters: c } ) =>
				pairings.find( ( p ) => _.xor( c, p ).length <= 0 ) == null ) );
	}

	page( page ) {
		return {
			method: 'GET',
			uri: 'https://archiveofourown.org/works',
			qsStringifyOptions: { format: 'RFC1738' },
			qs: _.mergeWith( {
				page,
				utf8: '✓',
				tag_id: 'RWBY',
				work_search: {
					sort_column: 'revised_at',
				},
			}, ...this.qs, ( a, b ) => {
				if( _.isArray( a ) ) {
					return a.concat( b );
				} else if( _.isString( a ) ) {
					return a + ' ' + b;
				}
				return undefined;
			} )
		};
	}
}
