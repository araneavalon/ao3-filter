'use strict';

import gulp from 'gulp';
import gutil from 'gulp-util';
import { spawn } from 'child_process';

import through from 'through2';

import browserify from 'browserify';
import watchify from 'watchify';
import babelify from 'babelify';

import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

import { development, production } from 'gulp-environments';
import eslint from 'gulp-eslint';
import sourcemaps from 'gulp-sourcemaps';
import uglify from 'gulp-uglify';
import babel from 'gulp-babel';


import VENDOR_EXPORTS from './vendor-bundle.json';
const VENDOR_IMPORTS = VENDOR_EXPORTS.map( ( module ) => module.expose || module );

const _getBrowserifyOptions = () => ( {
	entries: [ './src/index.js' ],
	paths: [ './node_modules', './src' ],
	debug: development()
} );


gulp.task( 'set:dev', development.task );
gulp.task( 'set:prod', production.task );


gulp.task( 'lint:app', () => {
	return gulp.src( 'src/**/*.js' )
		.pipe( eslint() )
		.pipe( eslint.format() )
		.pipe( eslint.failAfterError() )
} );

gulp.task( 'deps:app', () => {
	const b = browserify( { ..._getBrowserifyOptions(), debug: false } );
	process.stdout.write( '[\n' );
	b.pipeline.get( 'deps' ).push( through.obj(
		( { file, deps }, enc, next ) => {
			const filteredDeps = {};
			Object.keys( deps ).forEach( ( key ) => {
				if( deps[ key ] && ( new RegExp( `^${__dirname}/node_modules` ) ).test( deps[ key ] ) ) {
					filteredDeps[ key ] = deps[ key ];
				}
			} );
			if( Object.keys( filteredDeps ).length > 0 ) {
				const lines = JSON.stringify( { file, deps: filteredDeps }, null, 2 ).split( '\n' );
				for( let i = 0; i < lines.length; ++i ) {
					process.stdout.write( `  ${lines[ i ]}${( i === lines.length - 1 ) ? ',' : ''}\n` );
				}
			}
			next();
		},
		() => {
			process.stdout.write( ']\n' );
		}
	) );
	b.external( VENDOR_IMPORTS )
		.transform( babelify );
	return b.bundle();
} );

gulp.task( 'build:server', () => {
	return gulp.src( 'server/**/*.js' )
		.pipe( babel( {
			plugins: [ [ 'module-resolver', {
				root: './server'
			} ] ]
		} ) )
		.pipe( gulp.dest( 'build/server' ) );
} );
gulp.task( 'start:server', [ 'build:server' ], ( cb ) => {
	spawn( 'node', [ 'build/server/index.js' ], { stdio: 'inherit' } )
		.on( 'close', ( code ) => cb( code !== 0 ? code : null ) );
} );

gulp.task( 'build:vendor', () => {
	return browserify( {
		debug: false
	} )
		.require( VENDOR_EXPORTS )
		.bundle()
		.pipe( source( 'vendor.js' ) )
		.pipe( buffer() )
		.pipe( production( uglify() ) )
		.pipe( gulp.dest( 'build/src' ) );
} );

{
	const makeBundle = ( b ) => {
		b.external( VENDOR_IMPORTS )
			.transform( babelify );
		return () => {
			return b.bundle()
				.on( 'error', ( { message, stack } ) => gutil.log( 'Browserify Error', message, stack ) )
				.pipe( source( 'app.js' ) )
				.pipe( buffer() )
				.pipe( production( uglify() ) )
				.pipe( development( sourcemaps.init( { loadMaps: true } ) ) )
				.pipe( development( sourcemaps.write() ) )
				.pipe( gulp.dest( 'build/src' ) );
		};
	};

	gulp.task( 'build:app', [ 'lint:app' ], () => {
		const b = browserify( _getBrowserifyOptions() );
		return makeBundle( b )();
	} );

	gulp.task( 'watch:app', () => {
		const b = watchify( browserify( Object.assign( {}, watchify.args, _getBrowserifyOptions() ) ) );
		const bundle = makeBundle( b );
		b.on( 'update', bundle );
		b.on( 'log', gutil.log );
		bundle();
	} );
}

gulp.task( 'lint', [ 'lint:app' ] );
gulp.task( 'deps-app', [ 'deps:app' ] );

gulp.task( 'start-dev', [ 'set:dev', 'build:server', 'start:server' ] );

gulp.task( 'build-vendor', [ 'set:dev', 'build:vendor' ] );
gulp.task( 'watch-app', [ 'set:dev', 'watch:app' ] );

gulp.task( 'build-dev', [ 'set:dev', 'build:vendor', 'lint:app', 'build:app' ] );
gulp.task( 'build-prod', [ 'set:prod', 'build:vendor', 'lint:app', 'build:app' ] );

gulp.task( 'default', [ 'build-dev' ] );
