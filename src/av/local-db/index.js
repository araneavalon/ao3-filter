'use strict';

import loki from 'lokijs';
import { promiseYieldAll } from 'av/utils';


export const DEFAULT_OPTIONS = {
	filename: 'database.db',
	options: {
		autosave: true,
		autosaveInterval: 4000,
		autoload: true
	}
};

export default ( { init, api, filename = DEFAULT_OPTIONS.filename, options = {} } ) => {
	const db = ( new Promise( ( pass, fail ) => {
		const db = new loki( filename, {
			...DEFAULT_OPTIONS.options,
			...options,
			adapter: new loki.LokiLocalStorageAdapter(),
			autoloadCallback: ( error ) =>
				error ? fail( error ) : pass( db )
		} )
	} ) ).then( ( db ) => {
		init( db );
		return db;
	} ).then( ( db ) => {
		return api( db );
	} );

	db.yieldAll = function( gfn ) {
		return this.then( ( db ) =>
			promiseYieldAll( gfn( db ) ) );
	};

	return db;
};
