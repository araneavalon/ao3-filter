'use strict';

import _ from 'lodash';

export class Parser {
	static WORK_TYPE = null;
	static DEFAULT_WORK = {
		id: null,
		title: null,
		authors: [],
		summary: null,
		rating: null,
		language: null,
		chapters: [ null, null ],
		words: 0,
		hits: null,
		kudos: null,
		subscriptions: null,
		comments: null,
		bookmarks: null,
		updated: null,
		published: null,
		series: [],
		tags: [],
		errors: [],
	};

	getBaseWork() {
		const work = Object.assign( _.cloneDeep( this.constructor.DEFAULT_WORK ), { type: this.constructor.WORK_TYPE } );
		return new Proxy( work, {
			apply: () => {
				return work;
			},
			set: ( work, key, value ) => {
				if( typeof value !== 'function' ) {
					work[ key ] = value;
					return true;
				}
				try {
					work[ key ] = value();
					return true;
				} catch( e ) {
					work.errors.push( `Unable to parse work.${key}: "${e.message}"` );
					return false;
				}
			}
		} );
	}
}
