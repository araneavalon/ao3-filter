'use strict';

import request from 'request-promise-native';
import cheerio from 'cheerio';
import _ from 'lodash';


export class _Ao3Parser {
	static DEFAULT_WORK = {
		type: 'ao3',
		id: null,
		title: null,
		authors: [],
		summary: null,
		rating: null,
		language: null,
		chapters: [ null, null ],
		words: null,
		comments: 0,
		hits: 0,
		bookmarks: 0,
		kudos: 0,
		updated: null,
		published: null,
		series: [],
		tags: [],
		errors: [],
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
			.then( ( $ ) => Array.from( $( '.work.blurb.group' ) ) )
			.then( ( elements ) => Promise.all( elements.map( ( e ) => this.work( ( s ) => $( e ).find( s ) ) ) ) )
			.then( ( works ) => works.filters( ( work ) => work ) );
	}
	work( $ ) {
		return Promise.resolve( _.cloneDeep( _Ao3Parser.DEFAULT_WORK ) )
			.then( (  ) => {

			} );

		const heading = $( '.header.module > .heading' );
		this.workTry( work, 'id', () => Number( heading.find( 'a' ).first().attr( 'href' ).replace( /^\/works\//, '' ) ) );
		this.workTry( work, 'title', () => Number( heading.find( 'a' ).first().text().trim() ) );
		this.workTry( work, 'authors', () =>
			heading.find( 'a[rel="author"]' ).toArray().map( ( e ) =>
				$( e ).attr( 'href' ).match( /\/users\/(.+)\/psueds\/(.+)/ ).slice( 1 ) ) );



		this.workTry( work, 'updated', () => {} );

		return work;
	}
	workDates( id ) {

	}
}

// $( '.work.blurb.group' ).toArray().map( ( e ) => ( {
// 	id: $( e ).attr( 'id' ).replace( /^work_/, '' ),
// 	title: $( e ).find( '.header.module > .heading > a' ).first().text(),
// 	authors: $( e ).find( '.header.module > .heading > a[rel="author"]' ).toArray().map( ( e ) =>
// 		$( e ).attr( 'href' ).match( /\/users\/(.+)\/pseuds\/(.+)/ ).slice( 1 ) ),
// 	updated: $( e ).find( '.header.module > .datetime' ).text(),
// 	tags: [
// 		$( e ).find( '.header.module > .heading.fandoms a.tag' ).toArray().map( ( e ) => [ 'fandom', $( e ).text() ] ),
// 		[ [ 'rating', $( e ).find( '.header.module > .required-tags .rating' ).attr( 'title' ) ] ],
// 		$( e ).find( '.header.module > .required-tags .category' ).attr( 'title' ).split( ', ' ).map( ( t ) => [ 'category', t ] ),
// 		$( e ).find( '.tags > *' ).toArray().map( ( e ) => [
// 			$( e ).attr( 'class' ).split( ' ' )[ 0 ].slice( 0, -1 ),
// 			$( e ).find( '.tag' ).text()
// 		] ),
// 	].reduce( ( a, b ) => a.concat( b ), [] ),
// 	summary: $( e ).find( '.userstuff.summary p' ).toArray().map( ( e ) => $( e ).text() ),
// 	series: $( e ).find( '.series > *' ).toArray().map( ( e ) => [
// 		Number( $( e ).find( 'strong' ).text() ),
// 		[ Number( $( e ).find( 'a' ).attr( 'href' ).replace( '/series/', '' ) ), $( e ).find( 'a' ).text() ]
// 	] ),
// 	language: $( e ).find( '.stats > dd.language' ).text(),
// 	words: Number( $( e ).find( '.stats > dd.words' ).text().replace( ',', '' ) ),
// 	chapters: $( e ).find( '.stats > dd.chapters' ).text().split( '/' ).map( ( c ) => ( c === '?' ) ? null : Number( c ) ),
// 	comments: Number( $( e ).find( '.stats > dd.comments' ).text() ),
// 	kudos: Number( $( e ).find( '.stats > dd.kudos' ).text() ),
// 	bookmarks: Number( $( e ).find( '.stats > dd.bookmarks' ).text() ),
// 	hits: Number( $( e ).find( '.stats > dd.hits' ).text() ),
// } ) );

	
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
