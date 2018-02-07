'use strict';

import cheerio from 'cheerio';
import _ from 'lodash';


const _parseNumber = ( v ) => Number( v.replace( ',', '' ) ),
	_parseString = ( v ) => String( v );

export class _FFNetParser {
	static DEFAULT_WORK = {
		type: 'ff',
		id: null,
		title: null,
		author_id: null,
		author: null,
		summary: null,
		rating: null,
		language: null,
		genre: '',
		chapters: null,
		words: null,
		reviews: 0,
		favourites: 0,
		follows: 0,
		updated: null,
		published: null,
		characters: [],
		pairings: [],
		complete: false,
		errors: [],
	}
	static WORK_STAT_FORMATTERS = {
		Rated: [ 'rating', _parseString ],
		Chapters: [ 'chapters', _parseNumber ],
		Words: [ 'words', _parseNumber ],
		Reviews: [ 'reviews', _parseNumber ],
		Favs: [ 'favourites', _parseNumber ],
		Follows: [ 'follows', _parseNumber ],
	}

	_workTry( work, key, fn ) {
		try {
			work[ key ] = fn();
		} catch( e ) {
			work.errors.push( `Unable to parse work.${key}: "${e.message}"` );
		}
	}

	works( html ) {
		return Promise.resolve( cheerio.load( html ) )
			.then( ( $ ) =>
				Array.from( $( '.z-list.zhover.zpointer' ) )
					.map( ( e ) => this.work( ( s ) => $( e ).find( s ) ) )
					.filter( ( work ) => work ) );
	}
	work( $ ) {
		const work = _.cloneDeep( _FFNetParser.DEFAULT_WORK );

		this._workTry( work, 'id', () => Number( $( '.stitle' ).attr( 'href' ).match( /^\/s\/(\d+)\/1/ )[ 1 ] ) );
		this._workTry( work, 'title', () => $( '.stitle' ).text().trim() );
		this._workTry( work, 'author_id', () => Number( $( 'a[href^="/u/"]' ).attr( 'href' ).match( /^\/u\/(\d+)/ )[ 1 ] ) );
		this._workTry( work, 'author', () => $( 'a[href^="/u/"]' ).text().trim() );
		this._workTry( work, 'summary', () => $( '.z-indent.z-padtop' ).clone().children().remove().end().text().trim() );

		const stats = $( '.z-indent.z-padtop > .z-padtop2.xgray' );
		Object.assign( work, this.workStats( stats.text() ) );

		const dates = stats.find( 'span[data-xutime]' );
		this._workTry( work, 'updated', () => Number( $( dates.get( 0 ) ).attr( 'data-xutime' ) ) );
		this._workTry( work, 'published', () => Number( $( dates.get( ( dates.length > 1 ) ? 1 : 0 ) ).attr( 'data-xutime' ) ) );

		return work;
	}
	workStats( statsString ) {
		const out = {};
		statsString.trim().split( ' - ' ).forEach( ( s, i, { length: l } ) => {
			const m = s.match( /^(\w+?): (.+?)$/ );
			if( m != null ) {
				const f = _FFNetParser.WORK_STAT_FORMATTERS[ m[ 1 ] ];
				if( f != null ) {
					const [ key, fn ] = f;
					out[ key ] = fn( m[ 2 ] );
				}
				return;
			}
			if( s === 'Complete' ) {
				out.complete = true;
			} else if( i === 1 ) {
				out.language = s;
			} else if( i === 2 ) {
				out.genre = s;
			} else if( i === ( l - 1 ) || i === ( l - 2 ) ) {
				out.characters = s.split( /[\[\],]/g ).map( ( v ) => v.trim() ).filter( ( v ) => v ).sort();
				const m = s.match( /\[.+?\]/g );
				if( m != null ) {
					out.pairings = m.map( ( v ) => v.split( ',' ).map( ( v ) => v.replace( /[\[\]]/, '' ).trim() ).sort() );
				}
			}
		} );
		return out;
	}
}

export const FFNetParser = new _FFNetParser();
