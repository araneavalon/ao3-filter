'use strict';

import querystring from 'querystring';
const _fetch = fetch;

export const fetch = ( ...args ) => _fetch( ...args );

const _withQs = ( url, method, obj ) => {
	const qs = querystring.stringify( obj );
	return fetch( qs ? `${url}?${qs}` : url, { method } );
};
export const get = ( url, obj ) => _withQs( url, 'GET', obj );
export const del = ( url, obj ) => _withQs( url, 'DELETE', obj );

const _withBody = ( url, method, body ) => {
	return fetch( url, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( body )
	} )
}
export const post = ( url, obj ) => _withBody( url, 'POST', obj );
export const put = ( url, obj ) => _withBody( url, 'PUT', obj );
