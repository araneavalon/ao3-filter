'use strict';

import cheerio from 'cheerio';

import { Parser } from './parser';


const _parseNumber = ( v ) => Number( v.replace( ',', '' ) ),
	_parseString = ( v ) => String( v );

export class _FFParser extends Parser {
	static get DEFAULT_WORK() {
		return Object.assign( super.DEFAULT_WORK, { site: 'ff' } );
	}

	static WORK_STAT_FORMATTERS = {
		Rated: [ 'rating', _parseString ],
		Chapters: [ 'chapters', _parseNumber ],
		Words: [ 'words', _parseNumber ],
		Reviews: [ 'comments', _parseNumber ],
		Favs: [ 'kudos', _parseNumber ],
		Follows: [ 'subscriptions', _parseNumber ],
	};

	works( html ) {
		return Promise.resolve( cheerio.load( html ) )
			.then( ( $ ) =>
				Array.from( $( '.z-list.zhover.zpointer' ) )
					.map( ( e ) => this.work( ( s ) => $( e ).find( s ) ) )
					.filter( ( work ) => work ) );
	}
	work( $ ) {
		const work = this.getBaseWork();

		work.id = () => Number( $( '.stitle' ).attr( 'href' ).match( /^\/s\/(\d+)\/1/ )[ 1 ] );
		work.title = () => $( '.stitle' ).text().trim();

		const author = $( 'a[href^="/u/"]' );
		work.authors = () => [ [ author.text().trim(), `https://www.fanfiction.net/${author.attr( 'href' )}` ] ];

		work.summary = () => $( '.z-indent.z-padtop' ).clone().children().remove().end().text().trim();

		const stats = $( '.z-indent.z-padtop > .z-padtop2.xgray' );
		this.workStats( work, stats.text() );

		const dates = stats.find( 'span[data-xutime]' );
		work.updated = () => Number( $( dates.get( 0 ) ).attr( 'data-xutime' ) );
		work.published = () => Number( $( dates.get( ( dates.length > 1 ) ? 1 : 0 ) ).attr( 'data-xutime' ) );

		return work;
	}
	workStats( work, statsString ) {
		statsString.trim().split( ' - ' ).forEach( ( s, i, { length: l } ) => {
			const m = s.match( /^(\w+?): (.+?)$/ );
			if( m != null ) {
				const f = _FFParser.WORK_STAT_FORMATTERS[ m[ 1 ] ];
				if( f != null ) {
					const [ key, fn ] = f;
					work[ key ] = fn( m[ 2 ] );
				}
				return;
			}
			if( s === 'Complete' ) {
				if( work.chapters[ 0 ] != null ) {
					work.chapters[ 1 ] = work.chapters[ 0 ];
				}
			} else if( i === 1 ) {
				work.language = s;
			} else if( i === 2 ) {
				const genres = s.replace( 'Hurt/Comfort', '_HC_' ).split( '/' ).map( ( genre ) => genre.replace( '_HC_', 'Hurt/Comfort' ) );
				work.tags.push( ...genres.map( ( genre ) => ( { type: 'genre', name: genre } ) ) );
			} else if( i === ( l - 1 ) || i === ( l - 2 ) ) {
				const c = s.split( /[\[\],]/g ).map( ( v ) => v.trim() ).filter( ( v ) => v ).sort();
				work.tags.push( ...c.map( ( c ) => ( { type: 'character', name: c } ) ) );

				const m = s.match( /\[.+?\]/g );
				if( m != null ) {
					const p = m.map( ( v ) => v.split( ',' ).map( ( v ) => v.replace( /[\[\]]/, '' ).trim() ).sort() );
					work.tags.push( ...p.map( ( c ) => ( { type: 'relationship', characters: c } ) ) );
				}
			}
		} );
	}
}

export const FFParser = new _FFParser();
