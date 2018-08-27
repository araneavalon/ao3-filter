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

	constructor() {
		this.parseWorks = this.parseWorks.bind( this );
	}

	getWrappedWork() {
		const work = this.constructor.DEFAULT_WORK;
		const wrapped = {
			get: ( key ) => work[ key ],
			set: ( key, fn ) => wrapped.run( key, () => work[ key ] = fn() ),
			run: ( key, fn ) => {
				try {
					fn();
				} catch( e ) {
					work.errors.push( `Unable to parse work.${key}: "${e.message}"` );
				}
			},
			unwrap: () => work,
		};
		return wrapped;
	}

	async *parseWorks( html ) {
		throw new Error( `${this.constructor.name}.*parseWorks(${html.length}) not implemented.` );
	}
}
