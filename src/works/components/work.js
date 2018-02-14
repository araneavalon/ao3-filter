'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import moment from 'moment';

import * as Types from '../types';


@jss( ( $ ) => ( {
	work: {
		margin: [ '.643em', 0 ],
		border: [ '1px', 'solid', $.borderColor.normal ],
		padding: [ '.429em', '.75em' ],
	},
	header: {
		'& .required-tags': {
			width: '40px',
			display: 'flex',
			flexWrap: 'wrap',

			'& *': {
				width: '20px',
				height: '20px',
				flexShrink: 0,
			},
			'& *:nth-child(odd)': {
				marginRight: '3px',
			},
			'& *:nth-child(3), & *:nth-child(4)': {
				marginTop: '3px',
			},

			'& .General': {
				backgroundColor: 'green'
			},
			'& .Teen': {
				backgroundColor: 'yellow'
			},
			'& .Mature': {
				backgroundColor: 'orange'
			},
			'& .Explicit': {
				backgroundColor: 'red'
			},
			'& .Unrated': {
				backgroundColor: 'white'
			},
			'& .Gen': {
				backgroundColor: 'green'
			},
			'& .F-F': {
				backgroundColor: 'red'
			},
			'& .M-M': {
				backgroundColor: 'blue'
			},
			'& .F-M': {
				backgroundColor: 'orange'
			},
			'& .Multi': {
				backgroundColor: 'green'
			},
			'& .Other': {
				backgroundColor: 'black'
			},
			'& .Unknown': {
				backgroundColor: 'grey'
			},
			'& .archiveofourown-org': {
				backgroundColor: 'red'
			},
			'& .www-fanfiction-net': {
				backgroundColor: 'blue'
			},
			'& .one-shot': {
				backgroundColor: 'green'
			},
			'& .complete': {
				backgroundColor: 'orange'
			},
			'& .multi-chapter': {
				backgroundColor: 'red'
			},
		},
	},
} ) )
export class Work extends React.Component {
	static displayName = __filename;

	static propTypes = {
		work: Types.work.isRequired,
		classes: PropTypes.object.isRequired
	}

	getIconProps( work ) {
		const categories = work.tags.filter( ( { type } ) => type === 'category' ).map( ( { name } ) => name );
		const isComplete = work.chapters[ 0 ] === work.chapters[ 1 ],
			isOneShot = isComplete && work.chapters[ 0 ] === 1;
		return {
			rating: { className: work.rating, title: work.rating },
			category: {
				className: ( categories.length > 1 ) ? 'multi' : ( categories.length <= 0 ) ? 'unknown' : categories[ 0 ].replace( /\//g, '-' ),
				title: categories.join( ', ' ) || 'Unknown',
			},
			site: { className: work.site.replace( /\./g, '-' ), title: work.site },
			length: {
				className: isOneShot ? 'one-shot' : isComplete ? 'complete' : 'multi-chapter',
				title: isOneShot ? 'One-Shot' : isComplete ? 'Complete' : 'Multi-Chapter',
			},
		};
	}

	// site, id, title, authors, summary, language, rating, updated, published,
	// chapters, words, kudos, subscriptions, comments, bookmarks, tags, series, errors }
	render() {
		const { classes, work } = this.props,
			iconProps = this.getIconProps( work );
		if( work.published == null ) {
			console.log( 'published', work.id, work.title, work.published, work.errors );
		}
		return <div className={ classes.work }>
			<div className={ classes.header }>
				<div className="required-tags">
					<div { ...iconProps.rating }></div>
					<div { ...iconProps.category }></div>
					<div { ...iconProps.site }></div>
					<div { ...iconProps.length }></div>
				</div>
			</div>
		</div>;

		// return <div className={ classes.container }>
		// 	<div>{ rating } { title } - { author } { moment.utc( updated, 'X' ).format( 'DD MMM YYYY' ) }</div>
		// 	<div>{ pairings.map( ( p ) => `${p.join( '/' )}` ).concat( characters ).map( ( t ) => <span>{ t }, </span> ) }</div>
		// 	<div>{ summary }</div>
		// 	<div>{ chapters }/{ complete ? chapters : '?' } : { words }</div>
		// </div>;
	}
}
