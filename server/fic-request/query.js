'use strict';

import _ from 'lodash';


export class Query {
	static parseTerms( terms ) {
		return new this( terms );
	}

	constructor( terms ) {
		this.parsers = new Proxy( this, {
			get: ( target, _key ) => {
				const key = `parse${_.capitalize( _key )}`;
				return Reflect.has( target, key ) ?
					Reflect.get( target, key ) :
					() => ( [] );
			}
		} );

		this.qs = [];
		this.filters = [];

		for( const term of terms ) {
			const queries = this.parsers[ term.type ]( this.termPreparser( term ) );
			for( const query of _.isArray( queries ) ? queries : [ queries ] ) {
				if( _.isFunction( query ) ) {
					this.filters.push( query );
				} else if( _.isObject( query ) ) {
					this.qs.push( query );
				}
			}
		}
	}

	termPreparser( term ) {
		return Object.assign( {}, term, { not: ( p ) => {
			if( p == null ) {
				return term.not;
			} else if( !term.not ) {
				return p;
			} else if( _.isString( p ) ) {
				return '-' + p;
			} else if( _.isBoolean( p ) ) {
				return !p;
			} else if( _.isFunction( p ) ) {
				return ( work ) => !p( work );
			} else {
				return p;
			}
		} } );
	}

	page() {
		throw new Error( 'Virtual method Query.page not defined.' );
	}
	filter( works ) {
		return works.filter( ( work ) => this.filters.every( ( filter ) => filter( work ) ) );
	}
}
