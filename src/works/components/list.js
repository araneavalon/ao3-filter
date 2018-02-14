'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import * as Types from '../types';

import { Work } from './work';


@jss( {

} )
export class WorkList extends React.Component {
	static displayName = __filename;

	static propTypes = {
		works: Types.works.isRequired,
		classes: PropTypes.object.isRequired
	}

	render() {
		const { works } = this.props;
		return <div>
			{ works.map( ( work ) => {
				return <Work key={ work.id } work={ work } />
			} ) }
		</div>;
	}
}
