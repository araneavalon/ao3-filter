'use strict';

import _ from 'lodash';
import querystring from 'qs';


export class QueryFormatter {
	static getInstance() {
		if( this.instance == null ) {
			this.instance = new this();
		}
		return this.instance;
	}
	static formatQuery( terms ) {
		this.getInstance().formatQuery( terms );
	}

	constructor() {
		this.parsers = new Proxy( this, {
			get: ( target, _key ) => {
				const key = `parse${_.capitalize( _key )}`;
				return Reflect.has( target, key ) ?
					Reflect.get( target, key ) :
					() => ( [] );
			}
		} );
	}

	modifyTerm( term ) {
		return term;
	}

	formatQuery( terms, { qs = [], filters = [] } ) {
		for( let term of terms ) {
			const queries = this.parsers[ term.type ]( this.modifyTerm( term ) );
			for( let query of queries ) {
				if( _.isFunction( query ) ) {
					filters.push( query );
				} else if( _.isObject( query ) ) {
					qs.push( qs );
				}
			}
		}
		return [ qs, filters ];
	}
}

export class Ao3QueryFormatter extends QueryFormatter {
	getTagKey( type ) {
		return ( type.length < 6 ) ?
			`${type.toLowerCase()}_ids` :
			'filter_ids';
	}
	not( not, p ) {
		if( p == null ) {
			return not;
		} else if( _.isString( p ) ) {
			return '-' + p;
		} else if( _.isBoolean( p ) ) {
			return !p;
		} else if( _.isFunction( p ) ) {
			return ( work ) => !p( work );
		} else {
			return p;
		}
	}
	modifyTerm( term ) {
		if( term.not != null ) {
			return Object.assign( {}, term, { not: ( p ) => this.not( term.not, p ) } );
		}
		return term;
	}

	parseTitle( { not, fuzzy, value } ) {
		if( !fuzzy && !not() ) {
			return [ { work_search: { title: value } } ];
		}
		return [
			{ work_search: { query: not( `"${value}"` ) } },
			fuzzy ? null : ( work ) => not( work.title === value )
		];
	}
	parseAuthor( { not, fuzzy, value } ) {
		if( !fuzzy && !not() ) {
			return [ { work_search: { creator: value } } ];
		}
		return [
			{ work_search: { query: not( `"${value}"` ) } },
			fuzzy ? null : ( work ) => not( work.author === value )
		];
	}
	parseComplete( { not } ) {
		return [ { work_search: { complete: not() ? '0' : '1' } }, null ];
	}

	parseTag( { not, fuzzy, exact, type, id, name } ) {
		// 	TODO
		// 		Implement querystring filtering, when available.
		if( fuzzy ) {
			return [ { work_search: { query: not( `"${name}"` ) } } ];
		} else if( exact && type != null && id != null ) {
			return [ { work_search: { query: not( `${this.getTagKey( type )}:${id}` ) } } ];
		} else if( exact && name != null && !not() ) {
			return [ { work_search: { other_tag_names: [ name ] } } ];
		} else if( exact && name != null && not() ) {
			return [ ( work ) => not( work.tags.find( ( [ t, n ] ) => ( type == null || t === type ) && n === name ) != null ) ];
		} else if( !exact && name != null ) {
			return [ ( work ) => not( work.tags.find( ( [ t, n ] ) => ( type == null || t === type ) && n.contains( name ) ) != null ) ];
		}
		throw new Error( 'Attempted to filter a tag in a way that is not supported.' );
	}
	parseFandom( term ) {
		return this.parseTag( term );
	}
	parseWarning( term ) {
		return this.parseTag( term );
	}
	parsePairing( { characters } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement querystring filtering when available.
		return [ ( { not, tags } ) => {
			const pairings = tags.filter( ( [ t ] ) => t === 'pairing' ).map( ( [ , n ] ) => n.split( '/' ) );
			return not( pairings.some( ( c ) => characters.every( ( _c ) => c.includes( _c ) ) ) );
		} ];
	}
	parseCharacter( { not, name } ) {
		// 	TODO
		// 		Implement fuzzy
		// 		Implement querystring filtering when available.
		return [ ( { tags } ) => {
			const characters = tags
				.filter( ( [ t ] ) => t === 'character' || t === 'pairing' )
				.map( ( [ , n ] ) => n )
				.reduce( ( c, n ) => c.concat( n.split( '/' ) ), [] );
			return not( characters.includes( name ) );
		} ];
	}
	parseFreeform( term ) {
		return this.parseTag( term );
	}

	formatQuery( ...args ) {
		const [ qs, filters ] = super.formatQuery( ...args );

		// 	_.mergeWith( qs, query, ( a, b ) => {
		// 		if( _.isArray( a ) ) {
		// 			return a.concat( b );
		// 		} else if( _.isString( a ) ) {
		// 			return a + ' ' + b;
		// 		}
		// 		return undefined;
		// } );
		// qs { format: 'RFC1738' }
	}
}
