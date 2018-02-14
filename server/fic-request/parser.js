'use strict';


export class Parser {
	static get DEFAULT_WORK() {
		return {
			site: null,
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
	}

	getBaseWork() {
		const work = this.constructor.DEFAULT_WORK;
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
					work[ key ] = value( work[ key ] );
				} catch( e ) {
					work.errors.push( `Unable to parse work.${key}: "${e.message}"` );
				}
				return true;
			}
		} );
	}
}
