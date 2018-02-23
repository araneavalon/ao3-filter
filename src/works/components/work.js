'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import { Link } from 'av/elements';

import moment from 'moment';

import * as Types from '../types';

import { WithCommas } from './with-commas';
import { Rating, Category, Site, Length } from './icons';

const TAG_TYPE_ORDER = [ 'warning', 'relationship', 'character', 'genre', 'freeform' ];


@jss( ( $ ) => ( {
	work: {
		margin: [ '.643em', 0 ],
		border: [ '1px', 'solid', $.borderColor.normal ],
		padding: [ '.429em', '.75em' ],
	},
	header: {
		display: 'flex',

		'& > *': {
			display: 'inline-block',
		},

		'& .required-tags': {
			flexShrink: 0,
			width: '90px',
			display: 'flex',
			flexWrap: 'wrap',
		},
		'& .work-header': {
			flexGrow: 1,
			fontFamily: [ 'Georgia', 'serif' ],

			'& .title, & .authors': {
				fontSize: '1.15em',
			}
		},
		'& .date': {
			flexShrink: 0,
			fontFamily: 'monospace',
		},
	},
	tags: {
		'& .warning': {
			fontWeight: 'bold',
		},
	},
} ) )
export class Work extends React.Component {
	static displayName = __filename;

	static propTypes = {
		work: Types.work.isRequired,
		classes: PropTypes.object.isRequired
	}

	getWorkLink() {
		const { site, id } = this.props.work;
		switch( site ) {
			case 'archiveofourown.org':
				return `https://archiveofourown.org/works/${id}`;
			case 'www.fanfiction.net':
				return `https://www.fanfiction.net/s/${id}`;
			default:
				return '';
		}
	}

	// site, id, title, authors, summary, language, rating, updated, published,
	// chapters, words, kudos, subscriptions, comments, bookmarks, tags, series, errors }
	render() {
		const { classes, work } = this.props;
		return <div className={ classes.work }>
			<div className={ classes.header }>
				<div className="required-tags">
					<Rating rating={ work.rating } />
					<Category categories={ work.tags.filter( ( { type } ) => type === 'category' ).map( ( { name } ) => name )
						.concat( work.site === 'www.fanfiction.net' ? [ 'ff-net' ] : [] ) } />
					<Site site={ work.site } />
					<Length chapters={ work.chapters } />
				</div>
				<div className="work-header">
					<Link className="title" href={ this.getWorkLink() }>{ work.title }</Link>
					<span> by </span>
					<WithCommas className="authors">
					{ work.authors.map( ( [ author, url ] ) =>
						<Link key={ url } className="author" href={ url }>{ author }</Link> ) }
					</WithCommas>
					<WithCommas className="fandoms">
						{ work.tags.filter( ( { type } ) => type === 'fandom' ).map( ( { name } ) =>
							<Link key={ name } className="fandom" href={ `https://archiveofourown.org/tags/${name}/works` }>{ name }</Link> ) }
					</WithCommas>
				</div>
				<div className="date">{ moment.utc( work.updated, 'X' ).format( 'DD MMM YYYY' ) }</div>
			</div>
			<WithCommas className={ classes.tags }>
				{ work.tags
					.filter( ( { type } ) => ![ 'fandom', 'category' ].includes( type ) )
					.sort( ( { type: a }, { type: b } ) => TAG_TYPE_ORDER.indexOf( a ) - TAG_TYPE_ORDER.indexOf( b ) )
					.map( ( { type, name, characters } ) => [ type, ( type === 'relationship' ) ? characters.join( '/' ) : name ] )
					.map( ( [ type, name ] ) =>
						<span key={ `${type}:${name}` } className={ type }>{ name }</span> ) }
			</WithCommas>
			<div className={ classes.summary }>
				{ work.summary.split( '\n' ).map( ( line, index ) =>
					<div key={ index }>{ line }</div> ) }
			</div>
			<div className={ classes.stats }>STATS</div>
		</div>;
	}
}
