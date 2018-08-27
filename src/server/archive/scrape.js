'use strict';

import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import request from 'request-promise-native';
import uuid from 'uuid/v4';
import _ from 'lodash';
import moment from 'moment';
import cheerio from 'cheerio';

import { Limiter } from './limiter';

const makeUrl = ( ...args ) => {
	const parts = [];
	for( const part of args ) {
		if( _.isObject( part ) ) {
			for( const key in part ) {
				if( part[ key ] ) {
					parts.push( key );
				}
			}
		} else if( part || part === 0 ) {
			parts.push( part );
		}
	}
	return parts.join( '/' );
};


export class Scraper {
	static ARCHIVE_DIR = __dirname;

	constructor( url, id, title, options = {} ) {
		this.debug = this.constructor.DEBUG;
		this.limiter = this.constructor.LIMITER;

		this.debug( 'Scraper.new( %s, %s, %s, %j )', url, id, title, options );
		this.archiveDir = _.defaultTo( options.archiveDir, Scraper.ARCHIVE_DIR );

		this.url = url;
		this.id = id;
		this.title = title;

	}

	getFolderName( ts ) {
		const title = this.title.replace( /[^a-zA-Z0-9\.-_]/g, '-' ).replace( /--+/g, '-' ),
			subdir = moment.isMoment( ts ) ? ts.format( 'YYYY-MM-DD.HH-mm-ss' ) : 'latest';
		return path.join( `${title}.${this.id}`, subdir );
	}
	getFileName( number, name ) {
		return `${_.padStart( number, 3, '0' )}.${name}.html`;
	}

	_getChapters( folder, header, chapters ) {
		this.debug( 'getChapters( %s, %s, %j )', folder, header, chapters );
		if( header ) {
			return Promise.all( [
				this.getHeader()
					.then( ( header ) =>
						this.writeRawHeader( folder, header )
							.then( () => header ) ),
				this._getChapters( folder, false, chapters ),
			] )
				.then( ( [ header, { chapters } ] ) => ( { header, chapters } ) );
		} else {
			return this.limiter.execute(
				chapters.map( ( chapter ) =>
					() => this.getChapter( chapter )
						.then( ( chapter ) => this.writeRawChapter( folder, chapter )
								.then( () => chapter ) ) ) )
				.then( ( chapters ) => ( { chapters } ) );
		}
	}
	getChapters( header = false, chapters = [] ) {
		const folder = this.getFolderName( moment() ),
			src = path.join( this.archiveDir, folder ),
			dest = path.join( this.archiveDir, this.getFolderName() );
		return this._getChapters( folder, header, chapters )
			.then( ( out ) =>
				fs.unlink( dest )
					.catch( () => null ) // This failing is fine
					.then( () => fs.ensureSymlink( src, dest ) )
					.then( () => out ) );
	}

	writeRawHeader( folder, { raw, files } ) {
		this.debug( 'writeRawHeader( %s, %s, %s )', folder, raw.length, files.length );
		return Promise.all( [
			fs.outputFile( path.join( this.archiveDir, folder, this.getFileName( 0, 'header' ) ), raw ),
		].concat( files.map( ( { name, content } ) => {
			this.debug( 'writeRawCommon( %s, %s )', name, content.length );
			const file = path.join( this.archiveDir, folder, 'common', name );
			return fs.outputFile( file, content );
		} ) ) );
	}
	writeRawChapter( folder, { number, name, raw } ) {
		const _file = this.getFileName( number, name );
		this.debug( 'writeRawChapter( %s, %s )', _file, raw.length );
		const file = path.join( this.archiveDir, folder, _file );
		return fs.outputFile( file, raw );
	}
}

export class FFScraper extends Scraper {
	static DEBUG = debug( 'scraper:ff' );
	static LIMITER = new Limiter( 'ff' );

	constructor( id, title, options ) {
		super( 'https://www.fanfiction.net', id, title, options );
	}

	getFolderName( ts ) {
		return `ff.${super.getFolderName( ts )}`;
	}

	getCoverImage( src ) {
		this.debug( 'getCoverImage( %s )', src );
		return request( {
			method: 'GET',
			url: src,
			resolveWithFullResponse: true,
			encoding: null,
			headers: {
				referer: makeUrl( this.url, 's', this.id, 1 ),
			},
		} )
			.then( ( { headers, body } ) => {
				const type = headers[ 'content-type' ].split( '/' )[ 1 ];
				this.debug( 'getCoverImage( %s ) => %s %s', src, type, body.length );
				return { name: `cover.${type}`, content: body };
			} );
	}
	getHeader() {
		this.debug( 'getHeader()' );
		return request( {
			method: 'GET',
			url: makeUrl( this.url, 's', this.id, 1 ),
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				const $category = $( '#pre_story_links' ),
					$header = $( '#profile_top' ),
					$chapters = $( '#chap_select' ).first(),
					raw = [ $category, $header, $chapters ].map( ( $e ) => $.html( $e ) ).join( '\n\n' );

				const src = 'https:' + $header.find( 'img' ).attr( 'src' ).replace( /\/75\/$/, '/180/' );

				this.debug( 'getHeader() => %s', raw.length );
				return this.getCoverImage( src )
					.then( ( cover ) => ( { $, raw, files: [ cover ] } ) );
			} );
	}

	getChapter( chapter ) {
		this.debug( 'getChapter( %s )', chapter );
		return request( {
			method: 'GET',
			url: makeUrl( this.url, 's', this.id, chapter ),
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				const $chapter = $( 'option[selected]' ).first(),
					number = $chapter.attr( 'value' ),
					name = $chapter.text().replace( `${number}. `, '' );

				const raw = $.html( $( '#storytextp' ) );

				this.debug( 'getChapter( %s ) => %s, "%s", %s', chapter, number, name, raw.length );
				return { $, number, name, raw };
			} );
	}
}

export class Ao3Scraper extends Scraper {
	static DEBUG = debug( 'scraper:ao3' );
	static LIMITER = new Limiter( 'ao3' );

	constructor( id, title, options ) {
		super( 'https://archiveofourown.org', id, title, options );
	}

	getFolderName( ts ) {
		return `ao3.${super.getFolderName( ts )}`;
	}

	getCss( href, media, css ) {
		const name = ( href != null ) ? href.split( '/' ).slice( -2 ).join( '/' ) : `${( media != null ) ? media : uuid()}.css`;
		this.debug( 'getCss( %s, %s )', name, ( css || '' ).length );
		return (
			( href != null ) ?
				request( {
					method: 'GET',
					url: makeUrl( this.url, href ),
				} ) :
				Promise.resolve( css ) )
			.then( ( css ) => {
				const content = `/* ${media} */\n\n${css}`;
				this.debug( 'getCss( %s ) => %s', name, content.length );
				return { name, content };
			} );
	}
	getHeader() {
		this.debug( 'getHeader()' );
		return request( {
			method: 'GET',
			followRedirect: true,
			maxRedirects: 1,
			headers: {
				Cookie: 'user_credentials=84461e71bf7ac0f93c8c96a4231dace103dc00a99b6fd4a5c9a10d96c733ad21890c0500c83b04cf38449fda56b7cb7b78a64266b580fad9f5bcfd68519581d1%3A%3A2195168%3A%3A2018-06-29T16%3A30%3A12-04%3A00',
			},
			url: makeUrl( this.url, 'works', this.id ),
			qs: { view_adult: true },
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				const header = $.html( $( '.work.meta.group' ) ),
					chapters = $.html( $( '#chapter_index select' ) ),
					raw = header + '\n\n' + chapters;

				const files = []
					.concat(
						$( $( 'head' )
							.html()
							.split( /<\/title>|<!--sandbox for developers\t-->/g )[ 1 ]
							.trim()
							.replace( /\n/g, '' ) ).toArray(),
						$( 'div.work' ).find( 'link,style' ).toArray() )
					.map( ( e ) =>
						( e.nodeType === 8 ) ?
							$( `<${e.data.split( '><' )[ 1 ]}>` ).get( 0 ) :
							e )
					.filter( ( { name } ) => [ 'style', 'link' ].includes( name ) )
					.map( ( e ) => {
						const { name } = e,
							$e = $( e );
						return () =>
							this.getCss(
								( name === 'link' ) ? $e.attr( 'href' ) : null,
								$e.attr( 'media' ),
								( name === 'style' ) ? $e.html() : null );
					} );

				this.debug( 'getHeader() => %s, %s', raw.length, files.length );
				return this.limiter.execute( files )
					.then( ( files ) => ( { $, raw, files } ) );
			} );
	}
	getChapter( chapter = null ) {
		this.debug( 'getChapter( %s )', chapter );
		return request( {
			method: 'GET',
			followRedirect: true,
			maxRedirects: 1,
			headers: {
				Cookie: 'user_credentials=84461e71bf7ac0f93c8c96a4231dace103dc00a99b6fd4a5c9a10d96c733ad21890c0500c83b04cf38449fda56b7cb7b78a64266b580fad9f5bcfd68519581d1%3A%3A2195168%3A%3A2018-06-29T16%3A30%3A12-04%3A00',
			},
			url: makeUrl( this.url, 'works', this.id, { chapters: chapter }, chapter ),
			qs: { view_adult: true },
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				// Only used if chapter != null;
				const $chapter = $( '#chapter_index option[selected]' ),
					[ _number, ..._name ] = $chapter.text().split( '. ' ),
					number = ( $chapter.length > 0 ) ? Number( _number ) : '1',
					name = `${( $chapter.length > 0 ) ? _name.join( '. ' ) : 'Chapter 1'}.${chapter}`;

				const raw = `<!--Chapter ${number}: ${name}-->\n${$.html( $( '#workskin' ) )}`;

				this.debug( 'getChapter( %s ) => %s, "%s", %s', chapter, number, name, raw.length );
				return { $, number, name, raw };
			} );
	}
}
