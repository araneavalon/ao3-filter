'use strict';

import { Router } from 'express';
import request from 'request-promise-native';
import cheerio from 'cheerio';

const route = new Router();


route.use( '/', ( req, res, next ) => {
	if( req.query.json ) {
		req.query.json = JSON.parse( req.query.json );
	} else {
		req.query.json = {}
	}
	next();
} );

// TODO USE TAG ID
route.get( '/:tag/page/:page', ( req, res ) => {
	const { tag, page } = req.params,
		query = req.query.json;
	request( {
		uri: `https://archiveofourown.org/tags/${tag}/works`,
		qs: { page, ...query },
		transform: ( body ) => cheerio.load( body )
	} ).then( ( $ ) => {
		res.status( 200 ).json( $( '.work.blurb.group' ).toArray().map( ( e ) => ( {
			id: $( e ).attr( 'id' ).replace( /^work_/, '' ),
			title: $( e ).find( '.header.module > .heading > a' ).first().text(),
			authors: $( e ).find( '.header.module > .heading > a[rel="author"]' ).toArray().map( ( e ) =>
				$( e ).attr( 'href' ).match( /\/users\/(.+)\/pseuds\/(.+)/ ).slice( 1 ) ),
			updated: $( e ).find( '.header.module > .datetime' ).text(),
			tags: [
				$( e ).find( '.header.module > .heading.fandoms a.tag' ).toArray().map( ( e ) => [ 'fandom', $( e ).text() ] ),
				[ [ 'rating', $( e ).find( '.header.module > .required-tags .rating' ).attr( 'title' ) ] ],
				$( e ).find( '.header.module > .required-tags .category' ).attr( 'title' ).split( ', ' ).map( ( t ) => [ 'category', t ] ),
				$( e ).find( '.tags > *' ).toArray().map( ( e ) => [
					$( e ).attr( 'class' ).split( ' ' )[ 0 ].slice( 0, -1 ),
					$( e ).find( '.tag' ).text()
				] ),
			].reduce( ( a, b ) => a.concat( b ), [] ),
			summary: $( e ).find( '.userstuff.summary p' ).toArray().map( ( e ) => $( e ).text() ),
			series: $( e ).find( '.series > *' ).toArray().map( ( e ) => [
				Number( $( e ).find( 'strong' ).text() ),
				[ Number( $( e ).find( 'a' ).attr( 'href' ).replace( '/series/', '' ) ), $( e ).find( 'a' ).text() ]
			] ),
			language: $( e ).find( '.stats > dd.language' ).text(),
			words: Number( $( e ).find( '.stats > dd.words' ).text().replace( ',', '' ) ),
			chapters: $( e ).find( '.stats > dd.chapters' ).text().split( '/' ).map( ( c ) => ( c === '?' ) ? null : Number( c ) ),
			comments: Number( $( e ).find( '.stats > dd.comments' ).text() ),
			kudos: Number( $( e ).find( '.stats > dd.kudos' ).text() ),
			bookmarks: Number( $( e ).find( '.stats > dd.bookmarks' ).text() ),
			hits: Number( $( e ).find( '.stats > dd.hits' ).text() ),
		} ) ) );
	} ).catch( ( error ) => {
		console.error( error );
		res.status( 500 ).json( { error: error.message } );
	} );
} );


export default route;

