'use strict';


import { Ao3Query } from './ao3-query';
import { Ao3Parser } from './ao3-parser';

import { FFNetQuery } from './ff-net-query';
import { FFNetParser } from './ff-net-parser';

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

export class FFNetRequest extends Request {
	constructor( ...args ) {
		super( FFNetQuery, FFNetParser, ...args );
	}
}
CombinedRequest.addRequest( FFNetRequest );
