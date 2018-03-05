'use strict';

import React from 'react';

import * as Types from '../types';

import { Work } from './work';


export class WorkList extends React.Component {
	static displayName = __filename;

	static propTypes = {
		works: Types.works.isRequired,
	}

	render() {
		const { works } = this.props;
		return <div className="works">
			{ works.map( ( work ) =>
					<Work key={ work.id } work={ work } /> ) }
		</div>;
	}
}
