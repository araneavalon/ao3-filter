'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import moment from 'moment';

import * as Types from '../types';

import { Rating, Category, Site, Length } from './icons';


@jss( ( $ ) => ( {
	work: {
		margin: [ '.643em', 0 ],
		border: [ '1px', 'solid', $.borderColor.normal ],
		padding: [ '.429em', '.75em' ],
	},
	header: {
		'& .required-tags': {
			width: '56px',
			display: 'flex',
			flexWrap: 'wrap',
		},
	},
} ) )
export class Work extends React.Component {
	static displayName = __filename;

	static propTypes = {
		work: Types.work.isRequired,
		classes: PropTypes.object.isRequired
	}

	// site, id, title, authors, summary, language, rating, updated, published,
	// chapters, words, kudos, subscriptions, comments, bookmarks, tags, series, errors }
	render() {
		const { classes, work } = this.props;
		if( work.published == null ) {
			console.log( 'published', work.id, work.title, work.published, work.errors );
		}
		return <div className={ classes.work }>
			<div className={ classes.header }>
				<div className="required-tags">
					<Rating rating={ work.rating } />
					<Category categories={ work.tags.filter( ( { type } ) => type === 'category' ).map( ( { name } ) => name ) } />
					<Site site={ work.site } />
					<Length chapters={ work.chapters } />
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
