'use strict';


export const ao3 = {
	link: {
		PREFIX: 'https://archiveofourown.org',
		escape: ( name ) => encodeURIComponent( name.replace( /\//g, '*s*' ) ),

		author: ( user, psued ) => `${ao3.link.PREFIX}/users/${ao3.link.escape( user )}/psueds/${ao3.link.escape( psued )}`,
		work: ( id ) => `${ao3.link.PREFIX}/works/${id}`,
		series: ( id ) => `${ao3.link.PREFIX}/series/${id}`,
		fandom: ( name ) => ao3.link.tag( name ),
		tag: ( name ) => `${ao3.link.PREFIX}/tags/${ao3.link.escape( name )}/works`,

		comments: ( id ) => `${ao3.link.work( id )}?show_comments=true&view_full_work=true#comments`,
		kudos: ( id ) => `${ao3.link.work( id )}?view_full_work=true#comments`,
		bookmarks: ( id ) => `${ao3.link.work( id )}/bookmarks`,
	}
};

export const ff = {
	link: {
		PREFIX: 'https://www.fanfiction.net',
		escape: ( name ) => encodeURIComponent( name ),

		author: ( id ) => `${ff.link.PREFIX}/u/${id}`,
		work: ( id ) => `${ff.link.PREFIX}/s/${id}`,
		fandom: ( name ) => `${ff.link.PREFIX}/${name}`, // Specifically do not escape.
		tag: () => { throw new Error( 'ff.net does not support tag links at this time.' ); },

		comments: ( id ) => `${ff.link.PREFIX}/r/${id}`,
		kudos: () => null,
		bookmarks: () => null,
	}
};

export const getSite = ( site ) => {
	switch( site ) {
		case 'archiveofourown.org':
			return ao3;
		case 'www.fanfiction.net':
			return ff;
		default:
			throw new Error( `Unknown site "${site}".` );
	}
};
