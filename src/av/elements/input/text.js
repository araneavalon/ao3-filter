'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import jss from 'react-jss';
import cx from 'classnames';


@jss( ( $ ) => ( {
	text: {
		backgroundColor: $.bgColorPrimary,
		border: [ '1px', 'solid', $.borderColorPrimary ],
		borderRadius: '6px',
		padding: [ $.marginSmall, $.marginLarge ],
		color: $.colorPrimary
	}
} ) )
export class Text extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		classes: PropTypes.object.isRequired,
		value: PropTypes.string,
		onChange: PropTypes.func,
		onBlur: PropTypes.func,
		onEnter: PropTypes.func
	}

	static defaultProps = {
		onChange: () => {},
		onBlur: () => {},
		onEnter: () => {}
	}

	@autobind
	onChange( { target: { value } } ) {
		this.props.onChange( value );
	}
	@autobind
	onBlur( { target: { value } } ) {
		this.props.onBlur( value );
	}
	@autobind
	onKeyDown( { key, target: { value } } ) {
		if( key === 'Enter' ) {
			this.props.onEnter( value );
		}
	}

	render() {
		const { classes, className, style, value } = this.props;
		return <input
			type="text"
			className={ cx( classes.text, className ) }
			style={ style }
			value={ value }
			onChange={ this.onChange }
			onBlur={ this.onBlur }
			onKeyDown={ this.onKeyDown } />;
	}
}
