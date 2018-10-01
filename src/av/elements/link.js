'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';


@jss( ( $ ) => ( {
	link: {
		textDecoration: 'none',
		borderBottom: [ '1px', 'solid' ],

		'&.blue': {
			color: $.link.blue,
			'&:visited': {
				color: $.link.visited,
			}
		},
		'&.light': {
			color: $.link.light,
			'&:visited': {
				color: $.link.visited,
			},
		},
	}
} ) )
export class Link extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		href: PropTypes.string.isRequired,
		style: PropTypes.object,
		className: PropTypes.string,
		classes: PropTypes.object.isRequired,
	};

	render() {
		const { classes, className, style, href, children } = this.props;
		return <a
			href={ href }
			className={ cx( classes.link, className ) }
			style={ style }
		>{ children }</a>;
	}
}
