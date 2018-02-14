'use strict';


export function PropTypeError( message ) {
	this.message = message;
	this.stack = '';
}
PropTypeError.prototype = Error.prototype;
