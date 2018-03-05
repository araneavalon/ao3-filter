'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';

import _ from 'lodash';


@jss( () => ( {
	commas: {
		'& > .comma': {
			cursor: 'default',
		},
		'& > *[data-no-comma] + .comma, & > .comma:last-child': {
			display: 'none',
		},
	},
} ) )
export class WithCommas extends React.PureComponent {
	static displayName = __filename;

	static propTypes = {
		className: PropTypes.string,
		style: PropTypes.object,
		classes: PropTypes.object.isRequired,
		children: PropTypes.node,
	}

	render() {
		const { className, style, classes, children: c } = this.props,
			children = React.Children.toArray( c );
		if( children.length <= 0 ) {
			return null;
		}
		return <div className={ cx( classes.commas, className ) } style={ style }>
			{ _( children )
				.map( ( child, index ) =>
					[ child, <span key={ `comma:${index}` } className="comma">, </span> ] )
				.flatten()
				.filter()
				.value() }
		</div>;
	}
}
