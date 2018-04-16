'use strict';

import cheerio from 'cheerio';
import _ from 'lodash';

import { db } from 'db';
import { Parser } from 'fic-request/parser';


export class FFParser extends Parser {
	static get DEFAULT_WORK() {
		return Object.assign( super.DEFAULT_WORK, {
			site: 'www.fanfiction.net',
			tags: [
				{ type: 'fandom', name: 'anime/RWBY' }, // TODO
				{ type: 'warning', name: 'Creator Chose Not To Use Archive Warnings' },
			],
		} );
	}

	static RATINGS = {
		'K': 'General',
		'K+': 'Teen',
		'T': 'Teen',
		'M': 'Mature',
	};
	static PARSE_NUMBER = ( v ) => Number( v.replace( /,/g, '' ) );
	static PARSE_STRING = ( v ) => String( v );
	static WORK_STAT_FORMATTERS = {
		Rated: [ 'rating', ( v ) => FFParser.RATINGS[ FFParser.PARSE_STRING( v ) ] ],
		Chapters: [ 'chapters', ( v ) => [ FFParser.PARSE_NUMBER( v ), null ] ],
		Words: [ 'words', FFParser.PARSE_NUMBER ],
		Reviews: [ 'comments', FFParser.PARSE_NUMBER ],
		Favs: [ 'kudos', FFParser.PARSE_NUMBER ],
		Follows: [ 'subscriptions', FFParser.PARSE_NUMBER ],
	};

	constructor() {
		this.characters = db.tags.chain().find( { type: 'character' } );
	}

	async *parseWorks( html ) {
		const $ = cheerio.load( html );
		for ( const e of Array.from( $( '.z-list.zhover.zpointer' ) ) ) {
			const work = await this.parseWork( ( s ) => $( e ).find( s ) );
			if( work != null ) {
				yield work;
			}
		}
	}

	async parseWork( $ ) {
		const work = this.getWrappedWork();

		work.set( 'id', () => Number( $( '.stitle' ).attr( 'href' ).match( /^\/s\/(\d+)\/1/ )[ 1 ] ) );
		work.set( 'title', () => $( '.stitle' ).text().trim() );

		work.set( 'authors', () => {
			const author = $( 'a[href^="/u/"]' );
			return [ [
				author.text().trim(),
				author.attr( 'href' ).match( /\/u\/(\d+)/ )[ 1 ]
			] ];
		} );

		work.set( 'summary', () => $( '.z-indent.z-padtop' ).clone().children().remove().end().text().trim() );

		work.run( '[STATS,DATES]', () => {
			const stats = $( '.z-indent.z-padtop > .z-padtop2.xgray' );

			this.workStats( work, stats.text() );
			
			const dates = stats.find( 'span[data-xutime]' );
			work.set( 'updated', () => Number( $( dates.get( 0 ) ).attr( 'data-xutime' ) ) );
			work.set( 'published', () => Number( $( dates.get( ( dates.length > 1 ) ? 1 : 0 ) ).attr( 'data-xutime' ) ) );
		} );

		return work.unwrap();
	}
	workStats( work, statsString ) {
		statsString.trim().split( ' - ' ).forEach( ( s, i, { length: l } ) => {
			const m = s.match( /^(\w+?): (.+?)$/ );
			if( m != null ) {
				work.run( `[${s}]`, () => {
					const f = FFParser.WORK_STAT_FORMATTERS[ m[ 1 ] ];
					if( f != null ) {
						const [ key, fn ] = f;
						work.set( key, () => fn( m[ 2 ] ) );
					}
				} );
				return;
			}
			if( s === 'Complete' ) {
				work.run( 'Complete', () => {
					const c = work.get( 'chapters' );
					if( c[ 0 ] != null ) {
						c[ 1 ] = c[ 0 ];
					}
				} );
			} else if( i === 1 ) {
				work.set( 'language', () => s );
			} else if( i === 2 ) {
				work.run( 'genres', () => {
					const genres = s
						.replace( 'Hurt/Comfort', '_HC_' )
						.split( '/' )
						.map( ( genre ) => ( genre === '_HC_' ) ? 'Hurt/Comfort' : genre );
					work.get( 'tags' ).push( ...genres.map( ( genre ) => ( { type: 'freeform', name: genre } ) ) );
				} );
			} else if( i === ( l - 1 ) || i === ( l - 2 ) ) {
				work.run( 'characters', () => {
					const _c = s.split( /[\[\],]/g ).map( ( v ) => v.trim() ).filter( ( v ) => v ).sort(),
						c = this.fixCharacters( _c );
					work.tags.push( ...c.map( ( c ) => ( { type: 'character', name: c } ) ) );
				} );
				work.run( 'genres', () => {
					const m = s.match( /\[.+?\]/g );
					if( m != null ) {
						const p = m.map( ( v ) => v.split( ',' ).map( ( v ) => v.replace( /[\[\]]/, '' ).trim() ).sort() );
						work.tags.push( ...p.map( ( c ) => ( { type: 'relationship', characters: this.fixCharacters( c ) } ) ) );
					}
				} );
			}
		} );
	}

	fixCharacters( c ) {
		return _( c )
			.map( ( name ) => this.characters.branch.findOne( { 'ff-name': name } ).data() )
			.map( ( { name, expand } ) => [ name ].concat( expand ) )
			.flatten()
			.uniq()
			.filter()
			.value();
	}
}

export const ffParser = new FFParser();
