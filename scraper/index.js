'use strict';

const debug = require( 'debug' )( 'index' );

const request = require( 'request-promise-native' );
const _ = require( 'lodash' );
const { Scraper } = require( './scraper' );


const OUTPUT_DIR = __dirname;

const ao3Cookies = ( () => {
	const jar = request.jar();
	_.forEach( {
		_otwarchiuve_session: 'cjJ3T2o1UlR3eENEU1AyYlBkempQcTlvQ3lzeVd3Y2kxaWxFZEU3RFdVcXdiRzJZOHN0b2RWZlhZc3FHOEp6N3MrODBZeitsZkJ6V1ovQmtXNDRGTlJrRDBpbW9HTEhCSEFGeW1IcWxsamF1SFlqQVA4T3FSazVWTGl0WUVlK2JrQU9rV0NvYng0aWk4RGpTY2JNanpOa2lwcEV6VWJHTEcyTzZWbGl1bDhvTkdGM1BTYWpESThzYit0RGg4TWQ5VzVqMVoyV3l1RFE5eFZ1c3dTOHpEWmdOOUhnV2RYVUJzS28rWjhxeFZNdlJYZkxEM0hlSGxhVGJYQXFkNFd3VmZnQ1NYbWlJU1dsaDk3dER1TnI1OGxULzV6YkcwT1paSXNqTlVHT3c0anlQcTg3cTBnQ1Q5OXY3WUMzeG1kM1FOTHAzQXlXR1VRaW5KS25pOG1qdWNxSTl2YW9JV0p6UXB2QVB3VEFPUk54SUdmZTJtdFRqWXYwT1hhNEh0Rkg5UGE0NEZUTE5oZjE2MDgvRXZOb1dnVHlxVVdBcnF2c1FHNWpRTytvdDh5bzd3MEdpdFZEZVdIa1V5a2hZNlRNS1AvZ2pPaGt5YU8rZ2tCRi9INDNTR0ozWEh5bWltWVFDRUJpTVFuWlVhc1E9LS1PZlZmRFJKUGNMY2NYakVjeVNHWDJnPT0%3D--a36b6b7b1e56172fbc909d1424a7744c9ab84328',
		user_credentials: '84461e71bf7ac0f93c8c96a4231dace103dc00a99b6fd4a5c9a10d96c733ad21890c0500c83b04cf38449fda56b7cb7b78a64266b580fad9f5bcfd68519581d1%3A%3A2195168%3A%3A2018-05-27T17%3A50%3A33-04%3A00',
	}, ( { key, value } ) =>
		jar.setCookie( `${key}=${encodeURIComponent( value )}`, 'https://archiveofourown.org' ) );
	return jar;
} )();

const scraper = new Scraper( OUTPUT_DIR, [
	{ key: 'ao3', fn: ( page ) => {
		debug( 'ao3 page: %s', page );
		if( page > 10 ) {
			return null;
		}
		return request( {
			method: 'GET',
			url: 'https://archiveofourown.org/works',
			jar: ao3Cookies,
			qsStringifyOptions: { format: 'RFC1738' },
			qs: {
				page,
				tag_id: 'RWBY',
				work_search: {
					sort_column: 'revised_at',
				},
			},
		} );
	} },
	{ key: 'ff', fn: ( page ) => {
		if( page > 10 ) {
			return null;
		}
		return request( {
			method: 'GET',
			url: 'https://www.fanfiction.net/anime/RWBY/',
			qs: { p: page, srt: 1, r: 10 },
		} );
	} },
] );

scraper.scrape();
