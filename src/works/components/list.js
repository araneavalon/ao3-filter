'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import * as Types from '../types';

import { FFWork } from './ff-work';
import { Ao3Work } from './ao3-work';


const getWorkComponent = ( type ) => {
	switch( type ) {
		case 'ff': return FFWork;
		case 'ao3': return Ao3Work;
		default: return 'div';
	}
};

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
				const Work = getWorkComponent( work.type );
				return <Work key={ work.id } { ...work } />
			} ) }
		</div>;
	}
}
