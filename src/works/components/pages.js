'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';

import _ from 'lodash';

import { Button } from 'av/elements';


@jss( ( $ ) => ( {
	container: {
		textAlign: 'center',

		'& > *': {
			margin: [ $.margin.small, 0 ],

			'&:not(:last-child)': {
				marginRight: $.margin.small,
			},
		},
		'& > .spacer': {
			userSelect: 'none',
		},
		'& > .selected': {
			backgroundColor: $.colors.darker,
			borderColor: $.colors.darkest,
		},
	},
} ) )
export class Pages extends React.Component {
	static displayName = __filename;

	static propTypes = {
		page: PropTypes.number.isRequired,
		onChange: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	};

	render() {
		const { classes, page, onChange } = this.props,
			className = ( n ) => cx( { selected: page === n } );
		return <div className={ classes.container }>
			<Button className={ className( 1 ) } disabled={ page < 2 } onClick={ onChange.bind( null, page - 1 ) }>Previous</Button>
			<Button className={ className( 1 ) } disabled={ page === 1 } onClick={ onChange.bind( null, 1 ) }>1</Button>
			<Button className={ className( 2 ) } disabled={ page === 2 } onClick={ onChange.bind( null, 2 ) }>2</Button>
			{ page >= 9 &&
				<span className="spacer">...</span> }
			{ _.range( ( page < 9 ) ? 3 : page - 4, Math.max( 9, page + 4 ) + 1 ).map( ( n ) =>
				<Button key={ n } className={ className( n ) } disabled={ page === n } onClick={ onChange.bind( null, n ) }>{ n }</Button> ) }
			<Button className={ className() } onClick={ onChange.bind( null, page + 1 ) }>Next</Button>
		</div>;
	}
}
