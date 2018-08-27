'use strict';

import debug from 'debug';
import _ from 'lodash';


export class Source {
	static getFactory( options ) {
		return ( terms ) => new this( terms, options );
	}

	constructor( terms, options ) {
		this.debug = debug( `fic-request:${this.constructor.name}` );
		this.options = options;

		this.boundParsers = Object.create( null );
		this.parsers = new Proxy( this, {
			get: ( target, _key ) => {
				const key = `parse${_.capitalize( _key )}`;
				if( this.boundParsers[ key ] == null ) {
					this.boundParsers[ key ] =
						( target[ key ] != null ) ?
							target[ key ].bind( target ) :
							() => null;
				}
				return this.boundParsers[ key ];
			}
		} );

		this.terms = terms;
	}

	parse() {
		return Promise.resolve()
			.then( () => this.beforeParse() )
			.then( () =>
				Promise.all( this.terms.map( ( term ) => {
					this.debug( 'Parsing term: %s %j', term.type, term );
					return Promise.resolve( term )
						.then( ( term ) => this.beforeParseTerm( term ) )
						.then( ( term ) => [ term, this.parsers[ term.type ]( term ) ] )
						.then( ( [ term, _parsedTerms ] ) => {
							const parsedTerms = _.isArray( _parsedTerms ) ? _parsedTerms : [ _parsedTerms ];
							for( const parsed of parsedTerms ) {
								this.afterParseTerm( parsed, term );
							}
						} );
				} ) ) )
			.then( () => this.afterParse() );
	}

	beforeParse() {}
	beforeParseTerm( term ) {
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
	afterParseTerm( /* parsed, term */ ) {}
	afterParse() {}

	async work( id ) {
		return Promise.reject( `${this.constructor.name}.work(${JSON.stringify( id )}) is not implemented.` );
	}
	async page( page ) {
		return Promise.reject( `${this.constructor.name}.page(${page}) is not implemented.` );
	}
}
