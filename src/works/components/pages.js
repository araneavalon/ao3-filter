'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import _ from 'lodash';

import { Button } from 'av/elements';


@jss( ( $ ) => ( {
	container: {
		textAlign: 'center',
		display: 'flex',
		justifyContent: 'space-between',
		padding: [ $.margin.small, '.75em' ],
	},
	numbered: {
		'& > *': {
			'&:not(:last-child)': {
				marginRight: $.margin.small,
			},
		},
		'& > .spacer': {
			userSelect: 'none',
		},
	},
} ) )
export class Pages extends React.Component {
	static displayName = __filename;

	static propTypes = {
		page: PropTypes.number.isRequired,
		to: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	};

	render() {
		const { classes, page, to } = this.props;
		return <div className={ classes.container }>
			<Button selected={ page === 1 } disabled={ page < 2 } to={ to( page - 1 ) }>Previous</Button>
			<div className={ classes.numbered }>
				<Button selected={ page === 1 } disabled={ page === 1 } to={ to( 1 ) }>1</Button>
				<Button selected={ page === 2 } disabled={ page === 2 } to={ to( 2 ) }>2</Button>
				{ page >= 9 &&
					<span className="spacer">...</span> }
				{ _.range( ( page < 9 ) ? 3 : page - 4, Math.max( 9, page + 4 ) + 1 ).map( ( n ) =>
					<Button key={ n } selected={ page === n } disabled={ page === n } to={ to( n ) }>{ n }</Button> ) }
			</div>
			<Button selected={ false } to={ to( page + 1 ) }>Next</Button>
		</div>;
	}
}
