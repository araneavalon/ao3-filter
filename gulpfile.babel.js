'use strict';

import gulp from 'gulp';
import sequence from 'gulp-sequence';
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

const options = {
	get server() {
		return {
			root: './server',
			src: 'server/**/*.js',
			dest: 'build/server',
		};
	},
	get app() {
		return {
			root: './src',
			src: 'src/**/*.js',
			dest: 'build/src',
			file: 'app.js',
		};
	},
	get vendor() {
		return {
			dest: 'build/src',
			file: 'vendor.js',
		};
	},

	get browserify() {
		return {
			entries: [ `${options.app.root}/index.js` ],
			paths: [ './node_modules', options.app.root ],
			debug: development(),
		};
	},
	get watchify() {
		return { ...watchify.args, ...options.browserify };
	},
};


const _lint = ( src, canFail = true ) => {
	const p = gulp.src( src )
		.pipe( eslint() )
		.pipe( eslint.format() );
	return canFail ?
		p.pipe( eslint.failAfterError() ) :
		p;
};

const _makeBundle = ( b ) => {
	b.external( VENDOR_IMPORTS )
		.transform( babelify );
	return () => {
		return b.bundle()
			.on( 'error', ( { message, stack } ) => gutil.log( 'Browserify Error', message, stack ) )
			.pipe( source( options.app.file ) )
			.pipe( buffer() )
			.pipe( production( uglify() ) )
			.pipe( development( sourcemaps.init( { loadMaps: true } ) ) )
			.pipe( development( sourcemaps.write() ) )
			.pipe( gulp.dest( options.app.dest ) );
	};
};


gulp.task( '-set:prod', production.task );
gulp.task( '-set:dev', development.task );


gulp.task( '-deps:app', () => {
	const b = browserify( { ...options.browserify, debug: false } );
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
			process.stdout.write( `]\n` );
		}
	) );
	b.external( VENDOR_IMPORTS )
		.transform( babelify );
	return b.bundle();
} );

gulp.task( '-lint:app', () => {
	return _lint( options.app.src );
} );
gulp.task( '-lint:server', () => {
	return _lint( options.server.src );
} );


gulp.task( '-build:app', () => {
	return _makeBundle( browserify( options.browserify ) )();
} );
gulp.task( '-build:vendor', () => {
	return browserify( { debug: false } )
		.require( VENDOR_EXPORTS )
		.bundle()
		.pipe( source( options.vendor.file ) )
		.pipe( buffer() )
		.pipe( production( uglify() ) )
		.pipe( gulp.dest( options.vendor.dest ) );
} );
gulp.task( '-build:server', () => {
	return gulp.src( options.server.src )
		.pipe( babel( {
			plugins: [ [ 'module-resolver', {
				root: options.server.root
			} ] ]
		} ) )
		.pipe( gulp.dest( options.server.dest ) );
} );


gulp.task( '-start:server', ( cb ) => {
	spawn( 'node', [ `${options.server.dest}/index.js` ], { stdio: 'inherit' } )
		.on( 'close', ( code ) => cb( code !== 0 ? code : null ) );
} );

gulp.task( '-watch:app', () => {
	const b = watchify( browserify( options.watchify ) ),
		_bundle = _makeBundle( b );
	const bundle = () => {
		let continued = false;
		const s = through.obj(),
			next = () => {
				if( !continued ) {
					_bundle().pipe( s );
				}
				continued = true;
			};
		_lint( options.app.src, false )
			.on( 'data', () => {} )
			.on( 'error', ( error ) => s.emit( 'error', error ) )
			// Just to be really really sure that it will actually catch the end.
			.on( 'end', next )
			.on( 'close', next )
			.on( 'finish', next );
		return s;
	};
	b.on( 'update', bundle );
	b.on( 'log', gutil.log );
	bundle();
} );


gulp.task( 'deps:app', [ '-deps:app' ] );
gulp.task( 'deps', sequence( 'deps:app' ) );

gulp.task( 'lint:app', [ '-lint:app' ] );
gulp.task( 'lint:server', [ '-lint:server' ] );
gulp.task( 'lint', sequence( 'lint:server', 'lint:app' ) );

gulp.task( 'build:prod:app', sequence( '-set:prod', '-lint:app', '-build:app' ) );
gulp.task( 'build:dev:app', sequence( '-set:dev', '-lint:app', '-build:app' ) );
gulp.task( 'build:app', [ 'build:prod:app' ] );

gulp.task( 'build:prod:vendor', sequence( '-set:prod', '-build:vendor' ) );
gulp.task( 'build:dev:vendor', sequence( '-set:dev', '-build:vendor' ) );
gulp.task( 'build:vendor', [ 'build:prod:vendor' ] );

gulp.task( 'build:prod:server', sequence( '-set:prod', '-lint:server', '-build:server' ) );
gulp.task( 'build:dev:server', sequence( '-set:dev', '-lint:server', '-build:server' ) );
gulp.task( 'build:server', [ 'build:prod:server' ] );

gulp.task( 'start:prod:server', sequence( 'build:prod:server', '-start:server' ) );
gulp.task( 'start:dev:server', sequence( 'build:dev:server', '-start:server' ) );
gulp.task( 'start:server', [ 'start:prod:server' ] );

gulp.task( 'watch:dev:app', sequence( '-set:dev', '-watch:app' ) );
gulp.task( 'watch:app', [ 'watch:dev:app' ] );

gulp.task( 'default', sequence( [ 'build:vendor', 'build:app' ], 'start:server' ) );
