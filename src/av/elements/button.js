'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';


@jss( ( $ ) => ( {
	button: {
		borderWidth: '2px',
		borderStyle: 'solid',
		borderRadius: '100px',
		cursor: 'pointer',
		display: 'inline-block',
		padding: [ $.margin.small, $.margin.large ],
		userSelect: 'none',
		...$.button.primary,
		'&:hover': { ...$.button.hover },
		'&:active': { ...$.button.active },
	}
} ) )
export class Button extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		onClick: PropTypes.func,
		classes: PropTypes.object.isRequired
	}

	render() {
		const { classes, className, style, disabled, onClick, children } = this.props;
		return <div
			className={ cx( classes.button, className ) }
			style={ style }
			onClick={ !disabled && onClick }
		>{ children }</div>;
	}
}
