'use strict';

import gulp from 'gulp';
import sequence from 'gulp-sequence';
import gutil from './av/gulp-util';
import watch from 'gulp-watch';
import { spawn } from 'child_process';

import { development } from 'gulp-environments';
import eslint from 'gulp-eslint';
import babel from 'gulp-babel';


const _lint = ( src, canFail = !development() ) => {
	const p = gulp.src( src )
		.pipe( eslint() )
		.pipe( eslint.format() );
	return canFail ?
		p.pipe( eslint.failAfterError() ) :
		p;
};
gulp.task( '-lint', () => {
	return _lint( 'src/**/*.js' );
} );


gulp.task( '-build', () => {
	return gutil.allStreams( [
		gulp.src( 'src/**/*.njx' ),
		gulp.src( 'src/**/*.json' ),
		gulp.src( 'src/**/*.js' )
			.pipe( babel() ),
	] )
		.pipe( gulp.dest( 'build' ) );
} );
gulp.task( '-watch', () => {
	return gutil.allStreams( [
		watch( 'src/**/*.njx', { ignoreInitial: true } ),
		watch( 'src/**/*.json', { ignoreInitial: true } ),
		watch( 'src/**/*.js', { ignoreInitial: true } )
			.pipe( babel() ),
	] )
		.pipe( gulp.dest( 'build' ) );
} );

gulp.task( '-server:webpack', ( cb ) => {
	spawn( 'nodemon', [ 'build/server/webpack' ], { stdio: 'inherit' } )
		.on( 'close', ( code ) => cb( code !== 0 ? code : null ) );
} );
gulp.task( '-server', ( cb ) => {
	spawn( 'nodemon', [ 'build/server' ], { stdio: 'inherit' } )
		.on( 'close', ( code ) => cb( code !== 0 ? code : null ) );
} );


gulp.task( 'lint', [ '-lint' ] );

gulp.task( 'server:webpack', [ '-server:webpack' ] );
gulp.task( 'server', [ '-server' ] );

gulp.task( 'watch', sequence( '-build', '-watch' ) );
gulp.task( 'start', sequence( '-build', [ '-watch', '-server:webpack', '-server' ] ) );

gulp.task( 'default', [ 'start' ] );
