'use strict';

import request from 'request-promise-native';
import { StatusCodeError } from 'request-promise-native/errors';
import cheerio from 'cheerio';


export function URL( uri = '/' ) {
	return `https://archiveofourown.org${uri}`
}

export function login( username, password ) {
	const jar = request.jar();
	return Promise.resolve()
		.then( () =>
			request( {
				url: URL( '/login' ),
				jar,
			} ) )
		.then( ( html ) => cheerio.load( html ) )
		.then( ( $ ) => $( 'input[name="authenticity_token"]' ).attr( 'value' ) )
		.then( ( token ) =>
			request( {
				method: 'POST',
				url: URL( '/user_sessions' ),
				jar,
				formData: {
					authenticity_token: token,
					'user_session[login]': ( username != null ) ? username : '',
					'user_session[password]': ( password != null ) ? password : '',
					'user_session[remember_me]': 1,
				},
			} ) )
		.catch( ( error ) => {
			// Doing this rather than simple: false generates well-formed StatusCodeErrors.
			const isStatusCodeError = ( error instanceof StatusCodeError ),
				isRedirect = error.statusCode === 302,
				isUserPage = error.response.headers.location.startsWith( URL( '/users/' ) );
			if( !isStatusCodeError || !isRedirect || !isUserPage ) {
				console.error( 'error.statusCode', error.statusCode, error.message );
				console.error( 'error.response.headers', error.response.headers );
				throw error;
			}
		} )
		.then( () =>
			jar.getCookies( URL( '/' ) )
				.filter( ( { key } ) => [ '_otwarchive_session', 'user_credentials' ].includes( key ) ) );
}
