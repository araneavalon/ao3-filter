'use strict';

import { PropTypeError } from './prop-type-error';


export const makePropType = ( validate ) => {
	const checkType = ( isRequired, props, propName, componentName, location, propFullName ) => {
		componentName = componentName || '<<anonymous>>';
		propFullName = propFullName || propName;

		if( props[ propName ] == null ) {
			if( isRequired ) {
				return ( props[ propName ] === null ) ?
					new PropTypeError( `The ${location} \`${propFullName}\` is marked as required in \`${componentName}\`, but its value is \`null\`.` ) :
					new PropTypeError( `The ${location} \`${propFullName}\` is marked as required in \`${componentName}\`, but its value is \`undefined\`.` );
			}
			return null;
		} else {
			return validate( props, propName, componentName, location, propFullName );
		}
	};

	const chained = checkType.bind( null, false );
	chained.isRequired = checkType.bind( null, true );

	return chained;
}
