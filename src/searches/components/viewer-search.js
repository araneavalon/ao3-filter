'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import autobind from 'autobind-decorator';


@jss( ( $ ) => ( {
	container: {
		display: 'flex',
		cursor: 'pointer',
		padding: $.margin.small,
		'&:nth-child(even)': { ...$.list.even },
		'&:nth-child(odd)': { ...$.list.odd },
	}
} ) )
export class ViewerSearch extends React.Component {
	static displayName = __filename;

	static propTypes = {
		id: PropTypes.number.isRequired,
		name: PropTypes.string.isRequired,
		tags: PropTypes.arrayOf( PropTypes.number.isRequired ).isRequired,
		isBlacklist: PropTypes.bool,
		selectSearch: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired
	}

	@autobind
	selectSearch() {
		return this.props.selectSearch( this.props.id );
	}

	render() {
		const { classes, name, tags, isBlacklist } = this.props;
		return <div className={ classes.container } onClick={ this.selectSearch }>
			<div className={ classes.name }>{ name }</div>
			{ isBlacklist &&
				<div className={ classes.blacklist }>Blacklist</div> }
			{ tags.length > 0 &&
				<div className={ classes.tags } title={ tags.join( ', ' ) }>{ tags[ 0 ] }</div> }
		</div>;
	}
}
