'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider as JssThemeProvider } from 'react-jss';

import _ from 'lodash';


export const PARENT_ID = '$.';

export class ThemeProvider extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		theme: PropTypes.oneOfType( [ PropTypes.func, PropTypes.array, PropTypes.object ] ).isRequired,
		children: PropTypes.element.isRequired
	}

	static replace( parent, value ) {
		if( typeof value !== 'string' ) {
			return value;
		}
		return value.startsWith( PARENT_ID ) ?
			_.get( parent, value.slice( PARENT_ID.length ), value ) :
			value;
	}
	static iterate( parent, object ) {
		const fn = _.isArray( object ) ? _.map : _.mapValues;
		return fn( object, ( value ) =>
			( _.isArray( value ) || _.isObject( value ) ) ?
				ThemeProvider.iterate( parent, value ) :
				ThemeProvider.replace( parent, value ) );
	}
	static reduce( themes ) {
		if( !_.isArray( themes ) ) {
			return themes;
		}
		return themes.reduce( ( parent, theme ) =>
			Object.assign( {}, parent, ThemeProvider.iterate( parent, theme ) ) );
	}

	constructor( props ) {
		super( props );

		this.theme = ThemeProvider.reduce( this.props.theme );
	}


	render() {
		return <JssThemeProvider theme={ this.theme }>
			{ React.Children.only( this.props.children ) }
		</JssThemeProvider>;
	}
}
