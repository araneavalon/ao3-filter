'use strict';

import request from 'request-promise-native';
import _ from 'lodash';

import { db } from 'db';
import { QSSource } from 'fic-request/qs-query';

import { ffParser } from './parser';


export class FFSource extends QSSource {
	static RATINGS = {
		All: 10,
		General: 1,
		Teen: 10, // All because Teen -> K, K+
		Mature: 4,
		NotMature: 103,
	};

	constructor( terms, credentials, options ) {
		super( {
			url: 'https://www.fanfiction.net/anime/RWBY/',
			idKey: 'ff-id',
			pageSize: 25,
		}, terms, credentials, options );

		this.characters = db.tags.chain().find( { type: 'character' } );

		this.valid = true;
		this.rating = { name: null, not: null };
		this.complete = null;
		this.include = { c: [], r: [] };
		this.exclude = { c: [], r: [] };

		this.qs = {};
	}

	getCharacterId( name ) {
		const tag = this.characters.branch().findOne( { name } ).data();
		if( tag != null && tag[ 'ff-id' ] != null ) {
			return tag[ 'ff-id' ];
		}
		return null;
	}

	parseRating( { not, name } ) {
		if( name === 'Explicit' && !not() ) {
			this.valid = false;
			return;
		}
		// TODO allow redundant rating terms (+X -Y) => +X
		if( this.rating.name == null ) {
			this.rating = { name, not: not() };
		} else if( this.rating.name !== name || this.rating.not !== not() ) {
			this.valid = false;
		}
	}
	parseComplete( { not } ) {
		/**
		 *   0 - All
		 *   1 - In Progress
		 *   2 - Complete
		 */
		if( this.complete != null && this.complete !== !not() ) {
			this.valid = false;
		} else {
			this.complete = !not();
		}
	}
	parseWarning( { not, name } ) {
		const isAll = name === 'Creator Chose Not To Use Archive Warnings';
		if( ( isAll && not() ) || ( !isAll && !not() ) ) {
			this.valid = false;
		}
	}

	parseRelationship( { not, exact, characters } ) {
		const ids = characters.map( ( name ) => this.getCharacterId( name ) );
		if( ids.some( ( id ) => id == null ) ) {
			return;
		}
		if( !not() ) {
			this.include.c.push( ...ids );
		}
		if( exact ) {
			this[ not() ? 'exclude' : 'include' ].r.push( ids );
		}
	}
	parseCharacter( { not, name } ) {
		const id = this.getCharacterId( name );
		if( id != null ) {
			this[ not() ? 'exclude' : 'include' ].c.push( id );
		}
	}

	afterParse() {
		this.include.c = this.include.c.map( ( name ) => this.getCharacterId( name ) ).sort();
		this.include.r = this.include.r.map( ( characters ) => characters.map( ( name ) => this.getCharacterId( name ) ) );
		this.exclude.c = this.exclude.c.map( ( name ) => this.getCharacterId( name ) ).sort();
		this.exclude.r = this.exclude.r.map( ( characters ) => characters.map( ( name ) => this.getCharacterId( name ) ) );

		const isInvalid = [
			_.intersection( this.include.c, this.exclude.c ),
			_.intersectionWith( this.include.r, this.exclude.r, _.isEqual ),
			_.intersection( _.flatten( this.include.r ), this.exclude.c ),
		].some( ( i ) => i.length > 0 );
		if( isInvalid ) {
			this.valid = false;
		}

		if( !this.valid ) {
			return;
		}

		this.qs = { srt: 1, lan: 1 }; // TODO srt -> sort by (update date), lan -> language (1, english)

		if( this.rating.name != null ) {
			const { name, not } = this.rating;
			if( !not ) {
				this.qs.r = FFSource.RATINGS[ name ];
			} else if( not && name === 'Mature' ) {
				this.qs.r = FFSource.RATINGS.NotMature;
			} else {
				this.qs.r = FFSource.RATINGS.All;
			}
		}

		if( this.complete === true ) {
			this.qs.s = 2;
		} else if( this.complete === false ) {
			this.qs.s = 1;
		}

		const iR = this.include.r.filter( ( { length } ) => 0 < length && length <= 4 ),
			hasIR = iR.length > 0,
			cI = hasIR ? iR[ 0 ] : this.include.c.slice( -4 ); // 4 newest (roughly least popular)
		if( hasIR ) {
			this.qs.pm = 1; // Includes are relationship.
		}
		for( let i = 0; i < cI.length; ++i ) {
			this.qs[ `${i + 1}` ] = cI[ i ];
		}

		const eR = this.exclude.r.filter( ( { length } ) => 0 < length && length <= 4 ),
			hasER = eR.length > 0,
			cE = hasER ? eR[ 0 ] : this.exclude.c.slice( 0, 2 ); // 2 oldest (roughly most popular)
		if( hasER ) {
			this.qs._pm = 1; // Excludes are relationship.
		}
		for( let i = 0; i < cE.length; ++i ) {
			this.qs[ `_${i + 1}` ] = cE[ i ];
		}
	}

	async *requestPage( page ) {
		if( this.valid ) {
			yield* ffParser.parseWorks( await request( {
				method: 'GET',
				uri: this.URL,
				qs: { p: page, ...this.qs },
			} ) );
		}
	}
}
