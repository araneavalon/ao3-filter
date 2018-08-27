'use strict';

import request from 'request-promise-native';
import _ from 'lodash';


export function createSessionCookies( credentials ) {
	const jar = request.jar();
	_.forEach( credentials, ( { key, value } ) =>
			jar.setCookie( `${key}=${encodeURIComponent( value )}`, 'https://archiveofourown.org' ) );
	return jar;
}
