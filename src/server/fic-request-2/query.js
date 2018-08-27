'use strict';

const debug = require( 'debug' )( 'fic-request-2:query' );
import _ from 'lodash';


export class Query {
	static getQueryFactory( options ) {
		return ( terms ) => new this( terms, options );
	}

	constructor( terms, options = {} ) {
		this.options = options;
		this.terms = terms;

		this.boundParsers = Object.create( null );
		this.parsers = new Proxy( this, {
			get: ( target, _key ) => {
				const key = `parse${_.capitalize( _key )}`;
				if( !Reflect.has( this.boundParsers, key ) ) {
					Reflect.set( this.boundParsers, key,
						Reflect.has( target, key ) ?
							Reflect.get( target, key ).bind( target ) :
							() => null );
				}
				return Reflect.get( this.boundParsers, key );
			}
		} );

		this.qs = [];
		this.filters = [];

		this.beforeParse();
		for( const term of terms ) {
			debug( 'Getting queries for term: %s %j', term.type, term );
			const queries = this.parsers[ term.type ]( this.termPreparser( term ) );
			for( const query of _.isArray( queries ) ? queries : [ queries ] ) {
				if( _.isFunction( query ) ) {
					debug( 'Adding term to filters: %s', term.type );
					this.filters.push( query );
				} else if( _.isObject( query ) ) {
					debug( 'Adding term to queries: %s %j', term.type, query );
					this.qs.push( query );
				} else {
					debug( 'Doing nothing with term: %s %s', term.type, query );
				}
			}
		}
		this.afterParse();
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

	beforeParse() {}
	afterParse() {}

	request() {
		return Promise.reject( `${this.constructor.name}.request not implemented.` );
	}
	filter( works ) {
		return works.filter( ( work ) => this.filters.every( ( filter ) => filter( work ) ) );
	}
}
