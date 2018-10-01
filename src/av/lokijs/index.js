'use strict';

import _Loki from 'lokijs';


export class Loki extends _Loki {
	constructor( filename, collections, options = {} ) {
		super( filename, options );

		this.promise = new Promise( ( pass, fail ) =>
			this.loadDatabase( ( error ) =>
				error ? fail( error ) : pass( this ) ) );

		for( const name of collections ) {
			Object.defineProperty( this, name, {
				enumerable: false,
				get: () => this.getCollection( name ),
			} );
		}
	}

	saveDatabase( cb ) {
		if( cb == null ) {
			return new Promise( ( pass, fail ) =>
				super.saveDatabase( ( error ) =>
					error ? fail( error ) : pass() ) );
		} else {
			return super.saveDatabase( cb );
		}
	}

	addOrUpdateCollection( name, options, fn ) {
		const o = this.getCollection( name );
		let items = null;
		if( o != null ) {
			items = o.find();
			for( let i = 0; i < items.length; ++i ) {
				delete items[ i ][ '$loki' ];
				delete items[ i ].meta;
			}
			this.removeCollection( name );
		}
		const n = this.addCollection( name, options );
		if( items != null && items.length > 0 ) {
			n.insert( ( fn != null ) ?
				items.map( fn ).filter( ( item ) => item != null ) :
				items );
		}
		return n;
	}
}

export default Loki;
