'use strict';


import { Ao3Query } from './ao3-query';
import { Ao3Parser } from './ao3-parser';

import { FFQuery } from './ff-query';
import { FFParser } from './ff-parser';

import { Request } from './request';
export { RequestCache } from './cache';

import { CombinedRequest } from './combined-request';
export { CombinedRequest };


export class Ao3Request extends Request {
	constructor( ...args ) {
		super( Ao3Query, Ao3Parser, ...args );
	}
}
CombinedRequest.addRequest( Ao3Request );

export class FFRequest extends Request {
	constructor( ...args ) {
		super( FFQuery, FFParser, ...args );
	}
}
CombinedRequest.addRequest( FFRequest );
