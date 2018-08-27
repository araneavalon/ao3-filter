'use strict';

import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
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

		backgroundColor: $.backgroundColor.normal,
		borderColor: $.borderColor.normal,
		'&:hover': {
			backgroundColor: $.backgroundColor.hover,
			borderColor: $.borderColor.hover,
		},
		'&:active': {
			backgroundColor: $.backgroundColor.active,
		},

		'&.selected': {
			backgroundColor: $.colors.darker,
			borderColor: $.colors.darkest,
		},
		'&.disabled:not(.selected)': {
			cursor: 'default',
			backgroundColor: $.colors.mid,
			borderColor: $.colors.light,
			color: $.colors.lighter,
		},
	}
} ) )
export class Button extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		selected: PropTypes.bool,
		disabled: PropTypes.bool,
		onClick: PropTypes.func,
		to: PropTypes.oneOfType( [ PropTypes.string, PropTypes.shape( {
			pathname: PropTypes.string,
			search: PropTypes.string,
			hash: PropTypes.string,
			state: PropTypes.object,
		} ) ] ).isRequired,
		classes: PropTypes.object.isRequired,
		children: PropTypes.node.isRequired,
	};

	@autobind
	onClick( event ) {
		const { disabled, onClick } = this.props;
		if( disabled ) {
			event.preventDefault();
		} else if( onClick ) {
			onClick( event );
		}
	}

	render() {
		const { classes, className, style, selected, disabled, to, onClick, children } = this.props;
		return <Link
			className={ cx( classes.button, { selected, disabled }, className ) }
			style={ style }
			to={ to }
			onClick={ onClick }
		>{ children }</Link>;
	}
}
