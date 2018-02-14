'use strict';

import request from 'request-promise-native';
import cheerio from 'cheerio';
import moment from 'moment';
import _ from 'lodash';

import { Parser } from './parser';


export class _Ao3Parser extends Parser {
	static get DEFAULT_WORK() {
		return Object.assign( super.DEFAULT_WORK, { site: 'ao3' } );
	}

	works( html ) {
		const $ = cheerio.load( html );
		return Promise.resolve()
			.then( () => $( '.work.blurb.group' ).toArray() )
			.then( ( elements ) => Promise.all( elements.map( ( e ) => this.work( ( s ) => $( e ).find( s ) ) ) ) )
			.then( ( works ) => works.filters( ( work ) => work ) );
	}
	work( $ ) {
		const workHeading = Promise.resolve( this.getBaseWork() )
			.then( ( work ) => {
				const heading = $( '.header.module > .heading' );
				work.id = () => Number( heading.find( 'a' ).first().attr( 'href' ).replace( /^\/works\//, '' ) );
				work.title = () => Number( heading.find( 'a' ).first().text().trim() );
				work.authors = () =>
					heading.find( 'a[rel="author"]' ).toArray().map( ( e ) =>
						[ $( e ).text().trim(), `https://archiveofourown.org/${$( e ).attr( 'href' )}` ] );

				return work;
			} );
		return Promise.all( [
			workHeading.then( ( work ) => {
				work.updated = () => $( '.header.module > .datetime' ).text();
				work.rating = () => $( 'header.module > .required-tags .rating' ).attr( 'title' );
				work.tags = () => _.flatten( [
					$( '.header.module > .heading.fandoms a.tag' ).toArray().map( ( e ) => ( { type: 'fandom', name: $( e ).text() } ) ),
					$( '.header.module > .required-tags .category' ).attr( 'title' ).split( ', ' ).map( ( t ) => ( { type: 'category', name: t } ) ),
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
					Number( $( e ).find( 'string' ).text() ),
					[ Number( $( e ).find( 'a' ).attr( 'href' ).replace( '/series/', '' ) ), $( e ).find( 'a' ).text() ]
				] );
				work.language = () => this.workStat( $, 'language' );
				work.words = () => this.workStat( $, 'words', true );
				work.chapters = () => this.workStat( $, 'chapters' ).split( '/' ).map( ( c ) => ( c === '?' ) ? null : Number( c ) );
				work.comments = () => this.workStat( $, 'comments', true );
				work.kudos = () => this.workStat( $, 'kudos', true );
				work.bookmarks = () => this.workStat( $, 'bookmarks', true );
				work.hits = () => this.workStat( $, 'hits', true );
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
			uri: `https://archiveofourown.org/works/${id}`
		} ).then( ( html ) => cheerio.load( html ) ).then( ( $ ) => ( {
			updated: () => Number( $( '.download > .expandable > li > a' ).first().attr( 'href' ).match( /\?updated_at=(\d+)$/ )[ 1 ] ),
			published: () => moment.utc( $( 'dd.published' ).text(), 'YYYY-MM-DD' ).unix(),
		} ) );
	}
}

export const Ao3Parser = new _Ao3Parser();
