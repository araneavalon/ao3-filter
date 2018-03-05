'use strict';

import request from 'request-promise-native';
import cheerio from 'cheerio';
import moment from 'moment';
import _ from 'lodash';

import { Parser } from './parser';


export class _Ao3Parser extends Parser {
	static get DEFAULT_WORK() {
		return Object.assign( super.DEFAULT_WORK, { site: 'archiveofourown.org' } );
	}

	works( html ) {
		const $ = cheerio.load( html );
		return Promise.resolve()
			.then( () => $( '.work.blurb.group' ).toArray() )
			.then( ( elements ) => Promise.all( elements.map( ( e ) => this.work( ( s ) => $( e ).find( s ) ) ) ) )
			.then( ( works ) => works.filter( ( work ) => work ) )
			.then( ( works ) => works.sort( ( { updated: a }, { updated: b } ) => b - a ) );
	}
	work( $ ) {
		const workHeading = Promise.resolve( this.getBaseWork() )
			.then( ( work ) => {
				const heading = $( '.header.module > .heading' );
				work.id = () => Number( heading.find( 'a' ).first().attr( 'href' ).replace( /^\/works\//, '' ) );
				work.title = () => heading.find( 'a' ).first().text().trim();
				work.authors = () =>
					heading.find( 'a[rel="author"]' ).toArray().map( ( e ) =>
						[ $( e ).text().trim(), ...$( e ).attr( 'href' ).match( /^\/users\/(.+)\/pseuds\/(.+)$/ ).slice( 1, 3 ) ] );

				return work;
			} );
		return Promise.all( [
			workHeading.then( ( work ) => {
				work.updated = () => moment.utc( $( '.header.module > .datetime' ).text(), 'DD MMM YYYY' ).unix();
				work.rating = () => {
					const r = $( '.header.module > .required-tags .rating' ).attr( 'title' );
					switch( r ) {
						case 'Teen And Up Audiences':
						case 'General Audiences':
							return r.split( ' ' )[ 0 ];
						case 'Not Rated':
							return 'Unrated';
						default:
							return r;
					}
				};
				work.tags = () => _.flatten( [
					$( '.header.module > .heading.fandoms a.tag' ).toArray().map( ( e ) => ( { type: 'fandom', name: $( e ).text() } ) ),
					$( '.header.module > .required-tags .category' ).attr( 'title' ).split( ', ' )
						.filter( ( t ) => t !== 'No category' )
						.map( ( t ) => ( { type: 'category', name: t } ) ),
					$( '.tags > *' ).toArray().map( ( e ) => {
						const type = $( e ).attr( 'class' ).split( ' ' )[ 0 ].slice( 0, -1 ), // Make singular
							value = $( e ).find( '.tag' ).text();
						switch( type ) {
							case 'relationship':
								return { type, characters: value.split( '/' ) };
							default:
								return { type, name: value };
						}
					} ),
				] );
				work.summary = () => $( '.userstuff.summary p' ).toArray().map( ( e ) => $( e ).text().trim() ).join( '\n' )
				work.series = () => $( '.series > *' ).toArray().map( ( e ) => [
					Number( $( e ).find( 'strong' ).text() ), // Part
					$( e ).find( 'a' ).text(), // Name
					Number( $( e ).find( 'a' ).attr( 'href' ).replace( '/series/', '' ) ), // Id
				] );
				work.language = () => this.workStat( $, 'language' );
				work.words = () => this.workStat( $, 'words', true );
				work.chapters = () => this.workStat( $, 'chapters' ).split( '/' ).map( ( c ) => ( c === '?' ) ? null : Number( c ) );
				work.comments = () => this.workStat( $, 'comments', true );
				work.kudos = () => this.workStat( $, 'kudos', true );
				work.bookmarks = () => this.workStat( $, 'bookmarks', true );
				work.hits = () => this.workStat( $, 'hits', true );

				return work;
			} ),
			workHeading.then( ( { id } ) => this.workDates( id ) )
		] ).then( ( [ work, { updated, published } ] ) => {
			work.updated = updated;
			work.published = published;

			return work;
		} );
	}
	workStat( $, key, isNumeric ) {
		const v = $( `.stats > dd.${key}` ).text();
		return isNumeric ?
			Number( v.replace( ',', '' ) ) :
			v;
	}
	workDates( id ) {
		return request( {
			method: 'GET',
			headers: {
				Cookie: 'user_credentials=84461e71bf7ac0f93c8c96a4231dace103dc00a99b6fd4a5c9a10d96c733ad21890c0500c83b04cf38449fda56b7cb7b78a64266b580fad9f5bcfd68519581d1::2195168::2018-02-27T13:29:49-05:00' // TODO
			}, // TODO
			uri: `https://archiveofourown.org/works/${id}`
		} ).then( ( html ) => {
			return cheerio.load( html );
		} ).then( ( $ ) => ( {
			updated: ( prev ) => {
				const href = $( '.download > .expandable > li > a' ).first().attr( 'href' );
				if( href ) {
					return Number( href.match( /\?updated_at=(\d+)$/ )[ 1 ] );
				}
				return prev;
			},
			published: () => {
				return moment.utc( $( 'dd.published' ).text(), 'YYYY-MM-DD' ).unix();
			},
		} ) );
	}
}

export const Ao3Parser = new _Ao3Parser();
