'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import { Types as TagTypes } from 'tags/reducer';
import { Types } from '../reducer';

import { Button } from 'av/elements';
import { ViewerSearch } from './viewer-search';


@jss( ( $ ) => ( {
	container: {
		display: 'flex',
		flexDirection: 'column'
	},
	list: {
		display: 'flex',
		flexDirection: 'column'
	},
	buttons: {
		display: 'flex',
		justifyContent: 'flex-start',
		marginTop: $.margin.large
	}
} ) )
export class Viewer extends React.Component {
	static displayName = __filename;

	static propTypes = {
		tagsById: TagTypes.tagsById.isRequired,
		searches: Types.searches.isRequired,
		blacklists: PropTypes.arrayOf( PropTypes.number.isRequired ).isRequired,
		selectSearch: PropTypes.func.isRequired,
		addSearch: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	}

	render() {
		const { classes, tagsById, searches, blacklists, selectSearch, addSearch } = this.props;
		return <div className={ classes.container }>
			<div className={ classes.list }>
				{ searches.map( ( { id, name, tags } ) =>
					<ViewerSearch
						key={ id }
						id={ id }
						name={ name }
						tags={ tags.map( ( tag_id ) => tagsById[ tag_id ].name ) }
						isBlacklist={ blacklists.includes( id ) }
						selectSearch={ selectSearch } /> ) }
				{ searches.length <= 0 &&
					<div style={ { paddingLeft: '11px' } }>No Searches</div> }
			</div>
			<div className={ classes.buttons }>
				<Button onClick={ addSearch }>Add Search</Button>
			</div>
		</div>;
	}
}
