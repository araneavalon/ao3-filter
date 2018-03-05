'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'av/react-font-awesome';
import jss from 'react-jss';
import cx from 'classnames';

import * as Types from '../types';


@jss( () => ( {
	icon: {
		width: '40px',
		height: '40px',
		flexShrink: 0,

		fontSize: '32px',

		position: 'relative',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',

		'&:nth-child(odd)': {
			marginRight: '5px',
		},
		'&:nth-child(3), &:nth-child(4)': {
			marginTop: '5px',
		},

		'& .hidden': {
			position: 'absolute',
			top: 0,
			left: 0,
			maxWidth: '100%',
			fontSize: '8px',
			color: 'transparent',
			cursor: 'default',
			wordWrap: 'break-word',
		},
	},
} ) )
export class WorkIcon extends React.PureComponent {
	static displayName = __filename + ':WorkIcon';

	static propTypes = {
		className: PropTypes.string,
		title: PropTypes.string,
		classes: PropTypes.object.isRequired,
		children: PropTypes.node,
	}

	render() {
		const { className, title, classes, children } = this.props;
		return <div className={ cx( classes.icon, className ) } title={ title }>
			{ children }
		</div>;
	}
}


@jss( ( $ ) => ( {
	rating: {
		fontWeight: 'bold',
		userSelect: 'none',
	},

	General: {
		backgroundColor: $.colors.ao3Green,
	},
	Teen: { // TODO FIX VISIBILITY ISSUE
		backgroundColor: $.colors.ao3Yellow,
	},
	Mature: {
		backgroundColor: $.colors.ao3Orange,
	},
	Explicit: {
		backgroundColor: $.colors.ao3Red,
	},
	Unrated: {
		backgroundColor: 'white',
	},
} ) )
export class Rating extends React.PureComponent {
	static displayName = __filename +  ':Rating';

	static propTypes = {
		rating: Types.workShape.rating, // .isRequired
		classes: PropTypes.object.isRequired,
	}

	render() {
		const { rating, classes } = this.props,
			text = ( rating !== 'Unrated' ) ? rating.slice( 0, 1 ) : '';
		return <WorkIcon className={ classes[ rating ] } title={ rating }>
			<span className={ classes.rating }>{ text }</span>
			<span className="hidden">Rating: { rating }</span>
		</WorkIcon>;
	}
}

@jss( ( $ ) => ( {
	Gen: {
		backgroundColor: $.colors.ao3Green,
	},
	'F-F': {
		backgroundColor: $.colors.ao3Red,
	},
	'M-M': {
		backgroundColor: $.colors.ao3Blue,
	},
	'F-M': {
		backgroundColor: $.colors.ao3Purple,
	},
	Multi: {
		background: `linear-gradient(135deg, ${$.colors.ao3Green} 25%, ${$.colors.ao3Red} 45%, ${$.colors.ao3Purple} 55%, ${$.colors.ao3Blue})`,
	},
	Other: {
		backgroundColor: 'black',
	},
	Unknown: {
		backgroundColor: 'white',
	},
	'ff-net': { // TODO FIGURE THIS OUT AND REMOVE
		backgroundColor: $.colors.ffBlue
	}
} ) )
export class Category extends React.PureComponent {
	static displayName = __filename +  ':Category';

	static propTypes = {
		categories: PropTypes.arrayOf( PropTypes.oneOf( [ 'Gen', 'F/F', 'M/M', 'F/M', 'Multi', 'Other', 'ff-net' ] ).isRequired ).isRequired,
		classes: PropTypes.object.isRequired,
	}

	renderIcon( className ) {
		switch( className ) {
			case 'Gen': return <Icon set="regular" icon="dot-circle" />;
			case 'F-F': return <Icon set="solid" icon="venus" />;
			case 'M-M': return <Icon set="solid" icon="mars" />;
			case 'F-M': return <Icon set="solid" icon="transgender" />; // I know, but it matches ao3.
			case 'Other': return <Icon set="solid" icon="genderless" />;
			default: return null;
		}
	}
	render() {
		const { categories, classes } = this.props,
			className = ( categories.length > 1 ) ? 'Multi' : ( categories.length <= 0 ) ? 'Unknown' : categories[ 0 ].replace( /\//g, '-' ),
			title = categories.join( ', ' ) || 'Unknown';
		return <WorkIcon className={ classes[ className ] } title={ title }>
			{ this.renderIcon( className ) }
			<span className="hidden">Categor{ ( className === 'Multi' ) ? 'ies' : 'y' }: { title }</span>
		</WorkIcon>;
	}
}

@jss( ( $ ) => ( {
	'archiveofourown-org': {
		backgroundColor: $.colors.ao3Red,
	},
	'www-fanfiction-net': {
		backgroundColor: $.colors.ffBlue,
	},
} ) )
export class Site extends React.PureComponent {
	static displayName = __filename +  ':Site';

	static propTypes = {
		site: Types.workShape.site, // .isRequired
		classes: PropTypes.object.isRequired,
	}

	render() {
		const { site, classes } = this.props;
		return <WorkIcon className={ classes[ site.replace( /\./g, '-' ) ] } title={ site }>
			{ site === 'www.fanfiction.net' &&
				<Icon set="av" icon="ff-net" /> }
			{ site === 'archiveofourown.org' &&
				<Icon set="av" size="xs" icon="ao3" /> }
			<span className="hidden">Site: { site }</span>
		</WorkIcon>;
	}
}

@jss( ( $ ) => ( {
	true: {
		backgroundColor: $.colors.ao3Green,
	},
	false: {
		backgroundColor: $.colors.ao3Red,
	},
} ) )
export class Length extends React.PureComponent {
	static displayName = __filename +  ':Length';

	static propTypes = {
		chapters: Types.workShape.chapters, // .isRequired
		classes: PropTypes.object.isRequired,
	}

	render() {
		const { chapters, classes } = this.props,
			isComplete = chapters[ 0 ] === chapters[ 1 ],
			isOneShot = isComplete && chapters[ 0 ] === 1,
			title = isOneShot ? 'One-Shot' : isComplete ? 'Complete' : 'Incomplete';
		return <WorkIcon className={ classes[ isComplete ] } title={ title }>
			{ !isComplete &&
				<Icon set="solid" icon="ban" /> }
			{ isComplete &&
				<Icon set="solid" icon="check" /> }
			<span className="hidden">Length: { title }</span>
		</WorkIcon>;
	}
}
