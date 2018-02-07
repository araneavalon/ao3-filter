'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import { connect } from 'react-redux';

import {
	getWorks
} from '../actions';

import * as Types from '../types';

import { WorkList } from '../components/list';


@jss( {

} )
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
		classes: PropTypes.object.isRequired,
	}

	componentDidMount() {
		const { getWorks, page } = this.props;
		getWorks( page );
	}

	render() {
		const { loading, works } = this.props;
		return <div>
			{ loading &&
				<div>Loading!</div> }
			{ !loading &&
				<WorkList works={ works } /> }
		</div>;
	}
}
