'use strict';

import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import request from 'request-promise-native';
import _ from 'lodash';
import moment from 'moment';
import cheerio from 'cheerio';

import { Limiter } from './limiter';


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
		return path.join( `${this.id}.${title}`, subdir );
	}
	getFileName( number, name ) {
		return `${_.padStart( number, 3, '0' )}.${name}.html`;
	}

	_getChapters( folder, header, chapters ) {
		this.debug( 'getChapters( %s, %s, %j )', folder, header, chapters );
		if( header ) {
			return this.getHeader()
				.then( ( header ) => Promise.all( [
					header,
					this._getChapters( folder, false, chapters ),
					this.writeRawHeader( folder, header ),
				] ) )
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
				referer: [ this.url, 's', this.id, 1 ].join( '/' ),
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
			url: [ this.url, 's', this.id, 1 ].join( '/' ),
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				const category = $( '#pre_story_links' ),
					header = $( '#profile_top' ),
					chapters = $( '#chap_select' ).first(),
					raw = [ category, header, chapters ].map( ( e ) => $.html( e ) ).join( '\n\n' );

				const src = 'https:' + header.find( 'img' ).attr( 'src' ).replace( /\/75\/$/, '/180/' );

				this.debug( 'getHeader() => %s', raw.length );
				return this.getCoverImage( src )
					.then( ( cover ) => ( { $, raw, files: [ cover ] } ) );
			} );
	}

	getChapter( chapter ) {
		this.debug( 'getChapter( %s )', chapter );
		return request( {
			method: 'GET',
			url: [ this.url, 's', this.id, chapter ].join( '/' ),
		} )
			.then( ( body ) => cheerio.load( body ) )
			.then( ( $ ) => {
				const _chapter = $( 'option[selected]' ).first(),
					number = _chapter.attr( 'value' ),
					name = _chapter.text().replace( `${number}. `, '' );

				const raw = $.html( $( '#storytextp' ) );

				this.debug( 'getChapter( %s ) => %s, "%s", %s', chapter, number, name, raw.length );
				return { $, number, name, raw };
			} );
	}
}
