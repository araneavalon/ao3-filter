'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import { connect } from 'react-redux';

import { setPage } from '../actions';
import { Types } from '../reducer';

import { Button } from 'av/elements';
import { Searches } from 'searches';


@jss( ( $ ) => ( {
	container: {
		...$.page,
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		padding: [ '48px', '35%', '0px', '35%' ],
	},
	header: {
		display: 'flex',
		'& > *:first-child': {
			'marginRight': $.margin.small
		}
	},
	content: {
		marginTop: $.margin.large
	}
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
				<Button onClick={ setPage.bind( null, 'works' ) }>Works</Button>
				<Button onClick={ setPage.bind( null, 'searches' ) }>Searches</Button>
			</div>
			<div className={ classes.content }>
				{ page === 'searches' &&
					<Searches /> }
				{ page === 'works' &&
					null // <Works /> }
					}
			</div>
		</div>;
	}
}
