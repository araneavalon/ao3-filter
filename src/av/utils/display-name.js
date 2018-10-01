'use strict';

module.exports = function( { types: t } ) {
	return {
		visitor: {
			Class( path, state ) {
				const body = path.get( 'body' );
				for( const path of body.get( 'body' ) ) {
					if( !path.isProperty() ) {
						continue;
					}
					const { static: isStatic, key, value } = path.node;
					if( isStatic && key.name === 'displayName' && t.isIdentifier( value ) && value.name === '__filename' ) {
						const filename = state.file.opts.filename.replace( `${state.file.opts.root}/`, '' );
						path.node.value = t.stringLiteral( filename );
					}
				}
			},
		},
	};
}
