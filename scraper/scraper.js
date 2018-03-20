'use strict';

const debug = require( 'debug' )( 'scraper' );

const fs = require( 'fs-extra' );
const path = require( 'path' );

const moment = require( 'moment' );


exports.Scraper = class Scraper {
	constructor( outputDir, sites = [] ) {
		this.outputDir = outputDir;
		this.sites = [];

		sites.forEach( ( { key, fn } ) => this.addSite( key, fn ) );
	}

	addSite( key, fn ) {
		if( !this.sites.find( ( s ) => s.key === key ) ) {
			this.sites.push( { key, fn } );
		}
	}

	*page( ts, { key, fn } ) {
		let page = 1,
			p = null;
		while( ( p = fn( page++ ) ) ) {
			const file = path.join( this.outputDir, `${key}.${ts}`, `${page}.html` );
			yield p.then( ( html ) => fs.outputFile( file, html ) );
		}
	}
	*pages() {
		const ts = moment().format( 'YYYY-MM-DD.HH-mm-ss' );
		const sites = this.sites.map( ( site ) => this.page( ts, site ) );
		let promises = null;
		while( true ) {
			promises = sites.map( ( g ) => g.next().value );
			if( !promises.some( ( p ) => p ) ) {
				break;
			}
			yield Promise.all( promises );
		}
	}

	delay() {
		// 2.5-5s delay.
		return ( Math.random() * 2500 | 0 ) + 2500;
	}

	scrape() {
		return new Promise( ( pass, fail ) => {
			const g = this.pages();
			const fn = () => {
				const { done, value } = g.next();
				value
					.then( () => {
						if( done ) {
							pass();
						} else {
							setTimeout( fn, this.delay() );
						}
					} )
					.catch( ( error ) => fail( error ) );
			};
			fn();
		} );
	}
}
