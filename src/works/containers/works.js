'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import { connect } from 'react-redux';

import {
	getWorks
} from '../actions';

import * as Types from '../types';

import { WorkList } from '../components/list';
import { Pages } from '../components/pages';


@connect(
	( { works: { page, request_id, loading, list } } ) => ( {
		page,
		request_id,
		loading,
		works: list
	} ),
	( dispatch ) => ( {
		getWorks: ( page, request_id ) => dispatch( getWorks( page, request_id ) )
	} ),
	( s, { getWorks }, p ) => ( {
		...s,
		...p,
		getWorks: ( page ) => getWorks( page, s.request_id ),
	} )
)
export class Works extends React.Component {
	static displayName = __filename;

	static propTypes = {
		loading: PropTypes.bool,
		page: PropTypes.number.isRequired,
		works: Types.works.isRequired,
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
		const { loading, page, works } = this.props;
		return <div>
			<Pages page={ page } onChange={ this.getPage } />
			{ loading &&
				<div>Loading!</div> }
			{ !loading &&
				<WorkList works={ works } /> }
			<Pages page={ page } onChange={ this.getPage } />
		</div>;
	}
}
