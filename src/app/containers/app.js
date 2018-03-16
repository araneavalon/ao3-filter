'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import { connect } from 'react-redux';

import { setPage } from '../actions';
import { Types } from '../reducer';

import { Button } from 'av/elements';
import { Searches } from 'searches';
import { Works } from 'works';


@jss( ( $ ) => ( {
	container: {
		...$.page,
		minHeight: '100%',
		padding: [ '48px', '20%', '48px', '35%' ],
	},
	header: {
		display: 'flex',
		'& > *:first-child': {
			'marginRight': $.margin.small
		}
	},
	content: {
		marginTop: $.margin.large
	},

	'@global': {
		'ul, ol, li, button, dl, dt, dd, div, span, a': {
			border: 0,
			outline: 0,
			fontWeight: 'inherit',
			fontStyle: 'inherit',
			fontSize: '100%',
			fontFamily: 'inherit',
			verticalAlign: 'baseline',
			listStyle: 'none',
			margin: 0,
			padding: 0,
		},
		'.landmark': {
			fontSize: 0,
			lineHeight: 0,
			opacity: 0,
			height: 0,
		},
	},
} ) )
@connect(
	( { app: { page } } ) => ( { page } ),
	( dispatch ) => ( {
		setPage: ( page ) => dispatch( setPage( page ) )
	} )
)
export class App extends React.Component {
	static displayName = __filename;

	static propTypes = {
		page: Types.page.isRequired,
		setPage: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired
	}

	render() {
		const { classes, page, setPage } = this.props;
		return <div className={ classes.container }>
			<div className={ classes.header }>
				<Button selected={ page === 'works' } onClick={ setPage.bind( null, 'works' ) }>Works</Button>
				<Button selected={ page === 'searches' } onClick={ setPage.bind( null, 'searches' ) }>Searches</Button>
			</div>
			<div className={ classes.content }>
				{ page === 'searches' &&
					<Searches /> }
				{ page === 'works' &&
					<Works /> }
			</div>
		</div>;
	}
}
