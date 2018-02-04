'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';


@jss( () => ( {
	label: {
		cursor: 'default',
		userSelect: 'none'
	}
} ) )
export class Label extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		classes: PropTypes.object.isRequired
	}

	render() {
		const { classes, className, style, children } = this.props;
		return <div
			className={ cx( classes.label, className ) }
			style={ style }
		>{ children }</div>;
	}
}
