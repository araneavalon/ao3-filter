'use strict';

const debug = require( 'debug' )( 'fic-request-2:ao3-query' );
import request from 'request-promise-native';
import _ from 'lodash';

import { Query } from 'fic-request-2/query';
import { createSessionCookies } from './cookies';
import tagNames from './tag-names.json';


export class Ao3Query extends Query {
	getTagKey( type ) {
		return ( type.length < 6 ) ?
			`${type.toLowerCase()}_ids` :
			'filter_ids';
	}
	getTagName( name ) {
		const n = tagNames[ name ];
		return ( n != null ) ? n : name;
	}

	termPreparser( term ) {
		// TODO
		// Don't do this. Preferably add this shit to the fuckin' database?
		return Object.assign(
			super.termPreparser( term ),
			{ name: this.getTagName( term.name ) } );
	}

	parseId( { not, ao3 } ) {
		// TODO look up linked works by ff id.
		if( ao3 != null ) {
			return ( work ) => not( work.id === ao3 );
		}
		return null;
	}
	parseTitle( { not, fuzzy, value } ) {
		if( !not() && !fuzzy ) {
			return { work_search: { title: value } };
		}
		return [
			( fuzzy || !not() ) &&
				( { work_search: { query: not( `title:"${value}"` ) } } ),
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
				( { work_search: { query: not( `creator:"${value}"` ) } } ),
			!fuzzy &&
				( ( work ) => not( work.authors.find( ( [ author ] ) => author === value ) != null ) )
		];
	}
	parseRating( { not, fuzzy, name } ) {
		if( !not() && !fuzzy ) {
			return { work_search: { other_tag_names: [ name ] } };
		}
		return [
			( fuzzy || !not() ) &&
				( { work_search: { query: not( `"${name}"` ) } } ),
			!fuzzy &&
				( ( work ) => not( work.rating === name ) )
		];
	}
	parseComplete( { not } ) {
		if( !not() ) {
			return { work_search: { complete: '1' } };
		} else {
			return ( work ) => not( work.chapters[ 0 ] === work.chapters[ 1 ] )
		}
	}

	_parseTag( { not, fuzzy, exact, type, id, name } ) {
		// 	TODO
		// 		Implement querystring id filtering, when available.
		debug( 'ao3Query.parseTag %j', { not: not(), fuzzy, exact, type, id, name } );
		if( fuzzy ) {
			return { work_search: { query: not( `"${name}"` ) } };
		} else if( exact && type != null && id != null ) {
			return { work_search: { query: not( `${this.getTagKey( type )}:${id}` ) } };
		} else if( exact && name != null && !not() ) {
			return { work_search: { other_tag_names: [ name ] } };
		} else if( exact && name != null && not() ) {
			return ( work ) => not( work.tags.find( ( { type: t, name: n } ) => ( type == null || t === type ) && n === name ) != null );
		} else if( !exact && name != null ) {
			return ( work ) => not( work.tags.find( ( { type: t, name: n } ) => ( type == null || t === type ) && n.includes( name ) ) );
		}
		debug( 'Invalid tag: %j', { not: not(), fuzzy, exact, type, id, name } );
		throw new Error( 'Attempted to filter a tag in a way that is not supported.' );
	}
	parseFandom( term ) {
		return this._parseTag( term );
	}
	parseWarning( term ) {
		return this._parseTag( term );
	}
	parseCategory( term ) {
		return this._parseTag( term );
	}
	parseRelationship( term ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement qs filtering when available.
		const { not, exact, id, characters } = term;
		if( exact && id != null ) {
			return this._parseTag( term );
		} else if( characters ) {
			return ( work ) => not( work.tags
				.filter( ( { type } ) => type === 'relationship' )
				.some( ( { characters: c } ) =>
					( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
		}
		return null;
	}
	parseCharacter( { not, exact, name } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement qs filtering when available.
		return ( work ) => {
			const characters = [].concat(
				work.tags
					.filter( ( { type } ) => type === 'character' )
					.map( ( { name } ) => name ),
				!exact ?
					_( work.tags )
						.filter( ( { type } ) => type === 'relationship' )
						.map( ( { characters } ) => characters )
						.flatten()
						.value() :
					[]
			);
			return not( characters.includes( name ) );
		}
	}
	parseFreeform( term ) {
		return this._parseTag( term );
	}

	parseSeries( { not, name, id } ) {
		if( id != null ) {
			return ( work ) => not( work.series.find( ( [ , , _id ] ) => id === _id ) != null );
		} else if( name != null ) {
			return ( work ) => not( work.series.find( ( [ , _name, ] ) => name === _name ) != null );
		}
		return null;
	}

	parseRarepairs( { not, relationships } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				relationships.find( ( p ) => _.xor( c, p ).length <= 0 ) == null ) );
	}

	afterParse() {
		debug( 'Before qs merge: %s %j', this.filters.length, this.qs );
		this.qs = _.mergeWith( {
			tag_id: 'RWBY',
			work_search: {
				sort_column: 'revised_at',
			},
		}, ...this.qs, ( a, b ) => {
			if( _.isArray( a ) ) {
				return a.concat( b ).join( ',' );
			} else if( _.isString( a ) ) {
				return a + ' ' + b;
			}
			return undefined;
		} );
		this.qs = _.deepMapValues( this.qs, ( v ) => _.isArray( v ) ? v.join( ',' ) : v );
		debug( 'After qs merge: %s %j', this.filters.length, this.qs );
	}

	request( page, credentials ) {
		return request( {
			method: 'GET',
			url: 'https://archiveofourown.org/works',
			jar: createSessionCookies( credentials ),
			qsStringifyOptions: { format: 'RFC1738' },
			qs: { page, ...this.qs }
		} );
	}
}
