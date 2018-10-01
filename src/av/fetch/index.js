'use strict';

import querystring from 'querystring';
const _fetch = process.browser ? window.fetch : require( 'node-fetch' );

export const fetch = ( ...args ) => _fetch( ...args );

const _withQs = ( url, method, obj, opts = {} ) => {
	const qs = querystring.stringify( obj );
	return fetch( qs ? `${url}?${qs}` : url, { method, ...opts } );
};
export const get = ( url, obj, opts ) => _withQs( url, 'GET', obj, opts );
export const del = ( url, obj, opts ) => _withQs( url, 'DELETE', obj, opts );

const _withBody = ( url, method, body, opts = {} ) => {
	return fetch( url, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify( body ),
		...opts
	} )
}
export const post = ( url, obj, opts ) => _withBody( url, 'POST', obj, opts );
export const put = ( url, obj, opts ) => _withBody( url, 'PUT', obj, opts );
