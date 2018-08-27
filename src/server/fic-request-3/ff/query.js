'use strict';

import request from 'request-promise-native';
import _ from 'lodash';

import { getDatabase } from 'db';
import { Query } from 'fic-request-2/query';


export class FFQuery extends Query {
	beforeParse() {
		return getDatabase().then( ( db ) => {
			this.characters = db.tags.chain().find( { type: 'character' } );
		} );
	}

	parseTitle( { not, value } ) {
		return ( work ) => not( work.title === value );
	}
	parseAuthor( { not, value } ) {
		// ff works can only have one author.
		return ( work ) => not( work.authors[ 0 ][ 0 ] === value );
	}
	parseRating( { not, name } ) {
		// TODO qs filtering
		const isNone = ( name === 'Explicit' );
		if( isNone && !not() ) {
			return { invalid: true };
		}
		return ( work ) => not( work.rating === name );
	}
	parseComplete( { not } ) {
		// 0 -> all, 1 -> in progress, 2 -> complete
		const prev = this.qs.find( ( { complete } ) => complete != null );
		if( prev != null ) {
			const { complete } = prev;
			if( ( complete === 1 && !not() ) || ( complete === 2 && not() ) ) {
				return { invalid: true };
			}
		}
		return { complete: not() ? 1 : 2 };
	}

	parseWarning( { not, name } ) {
		const isAll = ( name === 'Creator Chose Not To Use Archive Warnings' );
		if( ( isAll && not() ) || ( !isAll && !not() ) ) {
			return { invalid: true };
		}
		return null;
	}

	parseRelationship( { not, exact, characters } ) {
		// TODO add qs filtering on ships, if possible.
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				( exact ? _.xor : _.difference )( characters, c ).length <= 0 ) );
	}
	parseCharacter( { not, name } ) {
		const prev = this.qs.filter( ( { character } ) => character != null ),
			include = prev.filter( ( { not } ) => !not() ),
			exclude = prev.filter( ( { not } ) => not() );
		if( !not() && include.length < 4 ) {
			const { 'ff-id': id } = this.characters.branch().findOne( { name: name } ).data() || {};
			if( id != null && include.find( ( { character } ) => character === id ) == null ) {
				return { character: id, not };
			}
		} else if( not() && exclude.length < 2 ) {
			const { 'ff-id': id } = this.characters.branch().findOne( { name: name } ).data() || {};
			if( id != null && exclude.find( ( { character } ) => character === id ) == null ) {
				return { character: id, not };
			}
		}
		// ff works always have all characters in relationships in character tags.
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'character' )
			.find( ( { name: n } ) => n === name ) != null );
	}

	parseRarepairs( { not, relationships } ) {
		return ( work ) => not( work.tags
			.filter( ( { type } ) => type === 'relationship' )
			.some( ( { characters: c } ) =>
				relationships.find( ( p ) => _.xor( c, p ).length <= 0 ) == null ) );
	}

	afterParse() {
		if( this.qs.find( ( { invalid } ) => invalid ) ) {
			this.qs = { invalid: true };
			return;
		}
		const { complete } = this.qs.find( ( { complete } ) => complete != null ) || {},
			include = this.qs.filter( ( { character, not } ) => character != null && !not() ),
			exclude = this.qs.filter( ( { character, not } ) => character != null && not() );
		this.qs = { srt: 1, lan: 1, r: 10 }; // TODO srt -> sort by (update date), lan -> language (1, english), r -> rating (10, all)
		if( complete != null ) {
			this.qs.s = complete.complete;
		}
		for( let i = 0; i < 4 && i < include.length; ++i ) {
			this.qs[ `c${i + 1}` ] = include[ i ].character;
		}
		for( let i = 0; i < 2 && i < exclude.length; ++i ) {
			this.qs[ `_c${i + 1}` ] = exclude[ i ].character;
		}
	}

	request( page ) {
		if( this.qs.invalid ) {
			return Promise.resolve( null );
		}
		return request( {
			method: 'GET',
			uri: 'https://www.fanfiction.net/anime/RWBY/',
			qs: { p: page, ...this.qs },
		} );
	}
}
