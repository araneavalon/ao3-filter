'use strict';


export const isSymbol = ( propType, propValue ) => {
	if( propType === 'symbol' ) {
		return true;
	}
	if( propValue[ '@@toStringTag' ] === 'Symbol' ) {
		return true;
	}
	if( typeof Symbol === 'function' && propValue instanceof Symbol ) {
		return true;
	}
	return false;
};

export const getPropType = ( propValue ) => {
	if( Array.isArray( propValue ) ) {
		return 'array';
	}
	if( propValue instanceof RegExp ) {
		return 'object';
	}
	const propType = typeof propValue;
	if( isSymbol( propType, propValue ) ) {
		return 'symbol';
	}
	return propType;
}
