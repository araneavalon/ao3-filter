'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import jss from 'react-jss';
import cx from 'classnames';

import { Icon } from 'av/react-font-awesome';


@jss( ( $ ) => ( {
	header: {
		cursor: 'pointer',
		userSelect: 'none',
		margin: [ $.margin.small, 0 ],
		borderBottom: [ '1.5px', 'solid', $.colors.light ],

		'&.isOpen': {},

		'& .arrow': {
			display: 'inline-block',
			padding: [ 0, '0.25em' ],
		},
	},
	section: {
		padding: [ 0, $.margin.small, $.margin.large ],

		display: 'none',
		'&.isOpen': {
			display: 'block',
		},
	},
} ) )
export class Accordion extends React.Component {
	static displayName = __filename;

	static propTypes = {
		classes: PropTypes.object.isRequired,
		children: PropTypes.node.isRequired,
	}

	constructor( props ) {
		super( props );

		this.state = {
			isOpen: false,
		};
	}

	@autobind
	onToggle() {
		this.setState( { isOpen: !this.state.isOpen } );
	}

	render() {
		const { classes } = this.props,
			{ isOpen } = this.state,
			children = React.Children.toArray( this.props.children );
		return <React.Fragment>
			<dt className={ cx( classes.header, { isOpen } ) } onClick={ this.onToggle }>
				<Icon
					className="arrow"
					dynamic={ isOpen }
					set="solid"
					transform={ isOpen ? 'rotate-90' : null }
					icon="angle-right" />
				<span className="landmark">{ children[ 0 ] }</span>
				{ children[ 0 ] }
			</dt>
			<dd className={ cx( classes.section, { isOpen } ) }>
				{ children.slice( 1 ) }
			</dd>
		</React.Fragment>;
	}
}
