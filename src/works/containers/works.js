'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import jss from 'react-jss';
import { connect } from 'react-redux';

import {
	getWorks
} from '../actions';

import * as Types from '../types';

import { WorkList } from '../components/list';
import { Pages } from '../components/pages';
import { FilterSidebar } from 'filter';


@connect(
	( { works: { page, loading, list }, filter: { terms } } ) => ( {
		page,
		loading,
		works: list,
		terms,
	} ),
	( dispatch ) => ( {
		getWorks: ( page, terms ) => dispatch( getWorks( page, terms ) )
	} ),
	( { terms, ...s }, { getWorks, ...a }, p ) => ( {
		...s,
		...a,
		...p,
		getWorks: ( page ) => getWorks( page, terms ),
	} )
)
@jss( () => ( {
	works: {
		display: 'flex',
		alignItems: 'flex-start',
	},
	list: {
		width: '66%',
	},
	sidebar: {
		width: '33%',
		marginTop: 'calc( 40px + .643em )',
		padding: [ '.429em', '.75em' ],
	},
} ) )
export class Works extends React.Component {
	static displayName = __filename;

	static propTypes = {
		loading: PropTypes.bool,
		page: PropTypes.number.isRequired,
		works: Types.works.isRequired,
		getWorks: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	}

	componentDidMount() {
		const { getWorks, page } = this.props;
		window.scrollTo( window.scrollX, 0 );
		getWorks( page );
	}

	@autobind
	getPage( page ) {
		window.scrollTo( window.scrollX, 0 );
		this.props.getWorks( page );
	}

	render() {
		const { loading, page, works, classes } = this.props;
		return <div className={ classes.works }>
			<div className={ classes.list }>
				<Pages page={ page } onChange={ this.getPage } />
				{ loading &&
					<div>Loading!</div> }
				{ !loading &&
					<WorkList works={ works } /> }
				<Pages page={ page } onChange={ this.getPage } />
			</div>
			<div className={ classes.sidebar }>
				<FilterSidebar />
			</div>
		</div>;
	}
}
