'use strict';

const util = require( 'util' ),
	{ spawn, execFile: _exec } = require( 'child_process' ),
	exec = util.promisify( _exec );
const { Transform, Writable } = require( 'stream' );


class Watcher {
	constructor( src, dest, onModify ) {
		this.src = src;
		this.dest = dest;

		this.onModify = ( typeof onModify === 'function' ) ?
			onModify :
			( file ) => exec( 'cp', [ this.getSrc( file ), this.getDest( file ) ] );
	}

	async watch() {
		// TODO initially clear dest and make sure it exists?
		await this.initDest();
		this.initWatcher();
	}

	async initDest() {
		// Remove directory if exists.
		try {
			await exec( 'rm', [ '-r', this.dest ] );
		} catch( error ) {
			if( !error.stderr.trim().endsWith( 'No such file or directory' ) ) {
				throw error;
			}
		}

		// (Re-)create directory.
		await exec( 'mkdir', [ '-p', this.dest ] );

		// Run onModify on the contents of src.
		const [ dirs, files ] = ( await Promise.all( [
			exec( 'find', [ this.src, '-type', 'd' ] ),
			exec( 'find', [ this.src, '-type', 'f' ] ),
		] ) ).map( ( { stdout } ) =>
			stdout.split( '\n' ).filter( ( v ) => v ) );
		for( const dir of dirs ) {
			this.MODIFY( dir, true );
		}
		for( const file of files ) {
			this.MODIFY( file, false );
		}
	}
	initWatcher() {
		const child = spawn( 'inotifywait', [
			'-qmr', '--format', '%w%f,%e',
			...Watcher.EVENTS.reduce( ( out, event ) => out.concat( [ '-e', event ] ), [] ),
			this.src ] );

		child.stderr.pipe( process.stderr );

		child.stdout
			.pipe( new Transform( {
				readableObjectMode: true,
				transform( chunk, encoding, callback ) {
					const lines = chunk.toString().split( '\n' ).filter( ( line ) => line );
					for( const line of lines ) {
						const [ file, ..._events ] = line.split( ',' ),
							isDir = _events[ _events.length - 1 ] === 'ISDIR',
							events = isDir ? _events.slice( 0, -1 ) : _events;
						for( const event of events ) {
							this.push( { file, event, isDir } );
						}
					}
					callback();
				}
			} ) )
			.pipe( new Writable( {
				objectMode: true,
				write: async ( { event, file, isDir }, encoding, callback ) => {
					try {
						await this[ event ]( file, isDir );
						callback();
					} catch( e ) {
						callback( e );
					}
				}
			} ) );
	}

	getSrc( file ) {
		return file;
	}
	getDest( file ) {
		return file.replace( this.src, this.dest );
	}

	CREATE( file, isDir ) {
		return exec( isDir ? 'mkdir' : 'touch', [ this.getDest( file ) ] );
	}
	DELETE( file, isDir ) {
		return exec( isDir ? 'rmdir' : 'rm', [ this.getDest( file ) ] )
			.catch( ( error ) =>
				!error.stderr.trim().endsWith( 'No such file or directory' ) &&
					Promise.reject( error ) );
	}
	MODIFY( file, isDir ) {
		return isDir ?
			this.CREATE( file, true ) :
			this.onModify( file );
	}
	MOVED_FROM( file, isDir ) {
		return this.DELETE( file, isDir );
	}
	MOVED_TO( file, isDir ) {
		return isDir ?
			exec( 'cp', [ '-r', this.getSrc( file ), this.getDest( file ) ] ) :
			exec( 'cp', [ this.getSrc( file ), this.getDest( file ) ] );
	}
}

Watcher.EVENTS = [
	'CREATE',
	'DELETE',
	'MODIFY',
	'MOVED_TO',
	'MOVED_FROM',
];


( new Watcher( './t', './b' ) ).watch();
