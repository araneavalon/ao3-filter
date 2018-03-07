'use strict';

import request from 'request-promise-native';


export function login( username, password ) {
	return request( {
		method: 'POST',
		resolveWithFullResponse: true,
		uri: 'https://archiveofourown.org/user_sessions',
		formData: {
			'user_sessions[login]': ( username != null ) ? username : '',
			'user_sessions[password]': ( password != null ) ? password : '',
		},
	} ).then( ( { headers } ) => {
		console.log( 'cookies!', headers );
	} ).catch( ( error ) => {
		console.error( 'error.statusCode', error.statusCode, error.message );
		if( error.statusCode === 302 ) {
			return;
		}
		console.error( error );
	} );
}
