'use strict';

const request = require( 'request-promise-native' );
const cheerio = require( 'cheerio' );
const _ = require( 'lodash' );



const P = [ [ 'Ruby R.', 'Weiss S.' ], [ 'Blake B.', 'Yang X.L.' ], [ 'L. Ren', 'Nora V.' ], [ 'Qrow B.', 'Winter S.' ] ];
const FILTER = ( { author, characters, pairings } ) =>
	[	author[ 1 ] !== 'Fallen-Shadow69',
		author[ 1 ] !== 'doomzoom',
		pairings.length > 0,
		!_.flatten( pairings ).includes( 'Adam T.' ),
		_.flatten( pairings ).find( ( v ) => v.startsWith( 'Team ' ) ) == null,
		_.differenceWith( pairings, P, _.isEqual ).length > 0,
	].every( ( b ) => b );



class Requester {
	constructor( category, qs ) {
		this.uri = `https://www.fanfiction.net/${category.join( '/' )}/`;
		this.qs = qs;
	}

	request( page = 1 ) {
		return request( {
			uri: this.uri,
			qs: Object.assign( { p: page }, this.qs ),
			transform: ( body ) => cheerio.load( body )
		} ).then( ( $ ) =>
			Array.from( $( '.z-list.zhover.zpointer' ) )
				.map( ( e ) => this._parseStory( ( s ) => $( e ).find( s ) ) )
				.filter( ( story ) => story ) );
	}

	_parseStory( $ ) {
		try {
			return Object.assign( {}, Requester.DEFAULT_STORY, {
				id: $( '.stitle' ).attr( 'href' ).match( /^\/s\/(\d+)\/1/ )[ 1 ],
				title: $( '.stitle' ).text(),
				author: $( 'a[href^="/u/"]' ).attr( 'href' ).match( /^\/u\/(\d+)\/(.+)$/ ).slice( 1, 3 ),
				summary: $( '.z-indent.z-padtop' ).clone().children().remove().end().text().trim(),
			}, this._parseStats( $( '.z-indent.z-padtop > .z-padtop2.xgray' ).text() ) )
		} catch( e ) {
			return Object.assign( {}, Requester.DEFAULT_STORY, { title: 'Error, Story Unparsable' } );
		}
	}
	_parseStats( str ) {
		const out = {};
		str.trim().split( ' - ' ).forEach( ( s, i, { length: l } ) => {
			const m = s.match( /^(\w+?): (.+?)$/ );
			if( m != null ) {
				const [ key, fn ] = Requester.STAT_FORMATTERS[ m[ 1 ] ];
				out[ key ] = fn( m[ 2 ] );
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

Requester.DEFAULT_STORY = {
	id: null,
	title: null,
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
};

const _parseNumber = ( v ) => Number( v.replace( ',', '' ) );
Requester.STAT_FORMATTERS = {
	Rated: [ 'rating', ( v ) => v ],
	Chapters: [ 'chapters', _parseNumber ],
	Words: [ 'words', _parseNumber ],
	Reviews: [ 'reviews', _parseNumber ],
	Favs: [ 'favourites', _parseNumber ],
	Follows: [ 'follows', _parseNumber ],
	Updated: [ 'updated', ( v ) => v ],
	Published: [ 'published', ( v ) => v ],
};



class Filter extends Requester {
	constructor( category, qs, filter ) {
		super( category, qs );

		this.filter = filter;

		this.rawPage = 1;
		this.cache = [];
	}

	fillCache( min, tries = 0 ) {
		if( min < this.cache.length ) {
			return Promise.resolve( this.cache );
		}
		if( tries >= Filter.MAX_TRIES ) {
			return Promise.reject( new Error( 'Max tries exceeded. Check filter.' ) );
		}
		return this.request( this.rawPage++ )
			.then( ( results ) => {
				return results.filter( this.filter );
			} )
			.then( ( results ) => {
				this.cache = this.cache.concat( results );
				return results;
			} )
			.then( ( results ) => {
				return this.fillCache( min, ( results.length <= 0 ) ? ( tries + 1 ) : 0 );
			} );
	}

	page( page = 1 ) {
		const start = ( page - 1 ) * Filter.PAGE_COUNT,
			end = page * Filter.PAGE_COUNT;
		return this.fillCache( end ).then( ( cache ) => cache.slice( start, end ) );
	}
}

Filter.MAX_TRIES = 3;
Filter.PAGE_COUNT = 10;





const f = new Filter(
	[ 'anime', 'RWBY' ],
	{ srt: 1, r: 10, /*c1: 101877,*/ _c1: 107779, _c2: 107390 },
	FILTER
);



const rl = require( 'readline' );
rl.emitKeypressEvents( process.stdin );
process.stdin.setRawMode( true );
process.stdin.resume();

let page = 1,
	wait = false;
const _page = () => {
	if( wait ) {
		return;
	}
	wait = true;
	process.stdout.write( '\x1Bc' );
	f.page( page++ ).then( ( results ) => {
		results.forEach( ( result ) => {
			process.stdout.write( `${result.title} | ${result.author[1]} | https://www.fanfiction.net/s/${result.id}\n` );
			process.stdout.write( `${result.summary}\n` );
			process.stdout.write( [
				result.updated || result.published,
				result.words,
				result.characters.join( ',' ),
				result.pairings.map( ( p ) => `[${p.join( ',' )}]` ).join( ',' )
			].join( ' | ' ) + '\n' );
			process.stdout.write( '\n' );
		} );
	} ).catch( ( error ) => {
		console.error( error );
		process.exit( 1 );
	} ).then( () => {
		wait = false;
	} );
};

process.stdin.on( 'keypress', ( s, key ) => {
	if( key.ctrl && key.name === 'c' ) {
		process.exit( 0 );
	}
	if( key.name === 'space' ) {
		_page();
	}
} );
_page();
