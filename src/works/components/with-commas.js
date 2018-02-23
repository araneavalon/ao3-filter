'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';


@jss( () => ( {
	commas: {
		'& > .comma': {
			cursor: 'default',
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
		const { className, style, classes, children } = this.props;
		return <div className={ cx( classes.commas, className ) } style={ style }>
			{ React.Children.toArray( children ).reduce( ( out, child, index, { length } ) => {
				out.push( child );
				if( index < ( length - 1 ) ) {
					out.push( <span key={ `comma:${index}` } className="comma">, </span> );
				}
				return out;
			}, [] ) }
		</div>;
	}
}
