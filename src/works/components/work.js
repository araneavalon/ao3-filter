'use strict';

import _debug from 'debug';
const debug = _debug( 'works:ui:work' );

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';
import cx from 'classnames';

import moment from 'moment';
import { ao3, getSite } from 'sites';

import * as Types from '../types';

import { Link } from 'av/elements';
import { WithCommas } from './with-commas';
import { Rating, Category, Site, Length } from './icons';
import { Stat } from './stat';


const TAG_TYPE_ORDER = [ 'warning', 'relationship', 'character', 'genre', 'freeform' ];


@jss( ( $ ) => ( {
	work: {
		margin: [ '.643em', 0 ],
		border: [ '1px', 'solid', $.borderColor.normal ],
		padding: [ '.429em', '.75em' ],

		'& > *:not(:last-child)': {
			// Because Reasons:tm:, it won't apply to last child regardless.
			marginBottom: $.margin.large,
		},

		'& .header': {
			display: 'flex',

			'& > *': {
				display: 'inline-block',
			},

			'& .required-tags': {
				order: 0,
				flexShrink: 0,
				width: '90px',
				display: 'flex',
				flexWrap: 'wrap',
			},
			'& .work-header': {
				order: 1,
				flexGrow: 1,
				fontFamily: [ 'Georgia', 'serif' ],

				'& .title, & .authors': {
					fontSize: '1.15em',
					display: 'inline',
				},
				'& .fandoms': {
					marginTop: $.margin.small,
				},
			},
			'& .date-container': {
				order: 2,
				flexShrink: 0,
				fontFamily: 'monospace',
			},
		},
		'& .tags': {
			'& .tag': {
				lineHeight: '1.5',
				borderBottom: [ '1px', 'dotted' ],

				'&:hover': {
					backgroundColor: $.link.blue,
					color: $.link.dark,
				},
			},
			'& .warning': {
				fontWeight: 'bold',
			},
		},
		'& .summary': {},
		'& .series': {
			'& .series': {
				marginRight: $.margin.large,
			},
		},
		'& .stats': {
			margin: 0,
			display: 'flex',
			justifyContent: 'flex-end',
			flexWrap: 'wrap',

			'& .stat': {
				whiteSpace: 'nowrap',
				marginLeft: $.margin.large,
			},
			'& dt, & dd': {
				display: 'inline',
				margin: 0,
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

	render() {
		const { classes, work } = this.props,
			site = getSite( work.site ),
			updated = moment.utc( work.updated, 'X' );
		debug( `${work.id} "${work.title}"`, work.errors );
		return <div className={ cx( classes.work, 'work' ) }>
			<div className="header">
				<div className="work-header">
					<span className="landmark">Work: </span>
					<Link className="title blue" href={ site.link.work( work.id ) }>{ work.title }</Link>
					<span> by </span>
					<WithCommas className="authors">
					{ work.authors.map( ( [ author, ...args ] ) =>
						<Link key={ author } className="author blue" href={ site.link.author( ...args ) }>{ author }</Link> ) }
					</WithCommas>
					<WithCommas className="fandoms">
						<span data-no-comma className="landmark">Fandoms: </span>
						{ work.tags.filter( ( { type } ) => type === 'fandom' ).map( ( { name } ) =>
							<Link key={ name } className="fandom light" href={ site.link.fandom( name ) }>{ name }</Link> ) }
					</WithCommas>
				</div>
				<div className="date-container">
					<span className="landmark">Last Updated: </span>
					<span className="date" title={ updated.format( 'YYYY-MM-DD HH:mm:ss' ) }>{ updated.format( 'DD MMM YYYY' ) }</span>
				</div>
				<div className="required-tags">
					<Rating rating={ work.rating } />
					<Category categories={ work.tags.filter( ( { type } ) => type === 'category' ).map( ( { name } ) => name ) } />
					<Site site={ work.site } />
					<Length chapters={ work.chapters } />
				</div>
			</div>
			<WithCommas className="tags">
				<span data-no-comma className="landmark">Tags: </span>
				{ work.tags
					.filter( ( { type } ) => ![ 'fandom', 'category' ].includes( type ) )
					.sort( ( { type: a }, { type: b } ) => TAG_TYPE_ORDER.indexOf( a ) - TAG_TYPE_ORDER.indexOf( b ) )
					.map( ( { type, name, characters } ) => [ type, ( type === 'relationship' ) ? characters.join( '/' ) : name ] )
					.map( ( [ type, name ] ) =>
						<Link key={ `${type}:${name}` } className={ cx( 'tag', 'light', type ) } href={ ao3.link.tag( name ) }>{ name }</Link> ) }
			</WithCommas>
			<div className="summary">
				<span className="landmark">Summary: </span>
				{ work.summary.split( '\n' ).map( ( line, index ) =>
					<div key={ index }>{ line }</div> ) }
			</div>
			{ work.series.length > 0 &&
				<div className="series">
					<span className="landmark">Series: </span>
					{ work.series.map( ( [ part, name, id ] ) =>
						<span key={ `series:${name}` } className="series">
							Part <b>{ part }</b> of <Link className="light" href={ ao3.link.series( id ) }>{ name }</Link>
						</span> ) }
				</div> }
			<dl className="stats">
				<Stat className="language" name="Language" formatType="string" value={ work.language } />
				<Stat className="words" name="Words" formatType="number" value={ work.words } />
				<Stat className="chapters" name="Chapters" formatType="chapters" value={ work.chapters } />
				{ work.comments > 0 &&
					<Stat className="comments" name="Comments" formatType="number" value={ work.comments } href={ site.link.comments( work.id ) }/> }
				{ work.kudos > 0 &&
					<Stat className="kudos" name="Kudos" formatType="number" value={ work.kudos } href={ site.link.kudos( work.id ) }/> }
				{ work.subscriptions > 0 &&
					<Stat className="subscriptions" name="Subscriptions" formatType="number" value={ work.subscriptions } /> }
				{ work.bookmarks > 0 &&
					<Stat className="bookmarks" name="Bookmarks" formatType="number" value={ work.bookmarks } href={ site.link.bookmarks( work.id ) }/> }
				{ work.hits > 0 &&
					<Stat className="hits" name="Hits" formatType="number" value={ work.hits } /> }
			</dl>
		</div>;
	}
}
