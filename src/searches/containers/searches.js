'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import { connect } from 'react-redux';

import _ from 'lodash';
import { natsort } from 'av/utils';

import { Types as TagTypes } from 'tags/reducer';
import { Types } from '../reducer';
import {
	loadSearches,
	addSearch,
	updateSearch,
	deleteSearch,
	selectSearch,
	addBlacklist,
	removeBlacklist
} from '../actions';

import { Viewer } from '../components/viewer';
import { Editor } from '../components/editor';


@jss( {
	container: {
		display: 'flex',
		flexDirection: 'column'
	}
} )
@connect(
	( { searches: { allIds, byId, blacklists, selected }, tags: { byId: tagsById } } ) => ( {
		selected,
		tagsById,
		searches: allIds.map( ( id ) => byId[ id ] ).sort( natsort().key( 'name' ) ),
		blacklists: blacklists
	} ),
	( dispatch ) => ( {
		loadSearches: () => dispatch( loadSearches() ),
		selectSearch: ( id ) => dispatch( selectSearch( id ) ),
		addSearch: () => dispatch( addSearch() ),
		updateSearch: ( search ) => dispatch( updateSearch( search ) ),
		deleteSearch: ( id ) => dispatch( deleteSearch( id ) ),
		addBlacklist: ( tag_id, search_id ) => dispatch( addBlacklist( tag_id, search_id ) ),
		removeBlacklist: ( tag_id, search_id ) => dispatch( removeBlacklist( tag_id, search_id ) ),
	} )
)
export class Searches extends React.Component {
	static displayName = __filename;

	static propTypes = {
		selected: PropTypes.number,
		tagsById: TagTypes.tagsById.isRequired,
		searches: Types.searches.isRequired,
		blacklists: Types.blacklists.isRequired,
		loadSearches: PropTypes.func.isRequired,
		selectSearch: PropTypes.func.isRequired,
		addSearch: PropTypes.func.isRequired,
		updateSearch: PropTypes.func.isRequired,
		deleteSearch: PropTypes.func.isRequired,
		addBlacklist: PropTypes.func.isRequired,
		removeBlacklist: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	}

	componentDidMount() {
		this.props.loadSearches();
	}

	render() {
		const { classes, selected, tagsById, searches, blacklists, selectSearch, addSearch } = this.props;
		return <div className={ classes.container }>
			{ selected == null &&
				<Viewer
					tagsById={ tagsById }
					searches={ searches }
					blacklists={ _.flatMap( blacklists ) }
					selectSearch={ selectSearch }
					addSearch={ addSearch } /> }
			{ selected != null &&
				<Editor /> }
		</div>;
	}
}
