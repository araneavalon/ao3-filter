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
		if( !not() && !fuzzy ) {
			return { work_search: { title: value } };
		}
		return [
			( fuzzy || !not() ) &&
				( { work_search: { query: not( `"${value}"` ) } } ),
			!fuzzy &&
				( ( work ) => not( work.title === value ) )
		];
	}
	parseAuthor( { not, fuzzy, value } ) {
		if( !not() && !fuzzy ) {
			return { work_search: { creator: value } };
		}
		return [
			( fuzzy || !not() ) &&
				( { work_search: { query: not( `"${value}"` ) } } ),
			!fuzzy &&
				( ( work ) => not( work.authors.find( ( [ author ] ) => author === value ) != null ) )
		];
	}
	parseRating( { not, fuzzy, value } ) {
		if( !not() && !fuzzy ) {
			return { work_search: { other_tag_names: [ value ] } };
		}
		return [
			( fuzzy || !not() ) &&
				( { work_search: { query: not( `"${value}"` ) } } ),
			!fuzzy &&
				( ( work ) => not( work.rating === value ) )
		];
	}
	parseComplete( { not } ) {
		if( !not() ) {
			return { work_search: { complete: '1' } };
		} else {
			return ( work ) => not( work.chapters[ 0 ] === work.chapters[ 1 ] )
		}
	}

	parseTag( { not, fuzzy, exact, type, id, name } ) {
		// 	TODO
		// 		Implement querystring id filtering, when available.
		if( fuzzy ) {
			return { work_search: { query: not( `"${name}"` ) } };
		} else if( exact && type != null && id != null ) {
			return { work_search: { query: not( `${this.getTagKey( type )}:${id}` ) } };
		} else if( exact && name != null && !not() ) {
			return { work_search: { other_tag_names: [ name ] } };
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
		return this.parseTag( term );
	}
	parseRelationship( { not, exact, characters } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement qs filtering when available.
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
	}
	parseCharacter( { not, exact, name } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement qs filtering when available.
		return ( work ) => {
			const characters = [].concat(
				!exact ?
					work.tags
						.filter( ( { type } ) => type === 'character' )
						.map( ( { name } ) => name ) :
					[],
				work.tags
					.filter( ( { type } ) => type == 'relationship' )
					.reduce( ( o, { characters } ) => o.concat( characters ), [] )
			);
			return not( characters.includes( name ) );
		}
	}
	parseFreeform( term ) {
		return this.parseTag( term );
	}

	parseRarepairs( { not, relationships } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				relationships.find( ( p ) => _.xor( c, p ).length <= 0 ) == null ) );
	}

	page( page ) {
		return {
			method: 'GET',
			headers: {
				Cookie: 'user_credentials=84461e71bf7ac0f93c8c96a4231dace103dc00a99b6fd4a5c9a10d96c733ad21890c0500c83b04cf38449fda56b7cb7b78a64266b580fad9f5bcfd68519581d1::2195168::2018-02-27T13:29:49-05:00' // TODO
			},
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
