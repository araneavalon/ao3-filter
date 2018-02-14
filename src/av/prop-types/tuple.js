'use strict';

import { makePropType } from './make-prop-type';
import { getPropType } from './get-prop-type';
import { PropTypeError } from './prop-type-error';


export const tuple = ( tupleTypes ) =>
	makePropType( ( props, propName, componentName, location, propFullName ) => {
		if( !Array.isArray( tupleTypes ) ) {
			return new PropTypeError( `Property \`${propFullName}\` of component \`${componentName}\` has invalid PropType notation inside of tuple.` );
		}
		const propValue = props[ propName ];
		if( !Array.isArray( propValue ) ) {
			const propType = getPropType( propValue );
			return new PropTypeError( `Invalid ${location} \`${propFullName}\` of type \`${propType}\` supplied to \`${componentName}\`, expected an array.` );
		}
		const l = Math.max( tupleTypes.length, propValue.length );
		for( let i = 0; i < l; i++ ) {
			const typeChecker = tupleTypes[ i ];
			if( typeof typeChecker !== 'function' ) {
				return new PropTypeError( `Property \`${propFullName}[${i}]\` of component \`${componentName}\` has invalid PropType notation inside of tuple.` );
			}
			const error = typeChecker( propValue, i, componentName, location, `${propFullName}[${i}].`, 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED' );
			if( error instanceof Error ) {
				return error;
			}
		}
		return null;
	} );
