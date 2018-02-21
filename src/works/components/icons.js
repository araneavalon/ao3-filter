'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'av/react-font-awesome';
import jss from 'react-jss';
import cx from 'classnames';

import * as Types from '../types';


@jss( ( $ ) => ( {
	'icon': {
		width: '25px',
		height: '25px',
		flexShrink: 0,
		fontSize: '20px',

		display: 'flex',
		justifyContent: 'space-around',
		alignItems: 'center',

		'&:nth-child(odd)': {
			marginRight: '3px',
		},
		'&:nth-child(3), &:nth-child(4)': {
			marginTop: '3px',
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
		textShadow: [
			'-1px -1px 0 black',
			'1px -1px 0 black',
			'-1px 1px 0 black',
			'1px 1px 0 black',
		]
	},

	General: {
		backgroundColor: '#77a600'
	},
	Teen: {
		backgroundColor: '#e8d506'
	},
	Mature: {
		backgroundColor: '#e67300'
	},
	Explicit: {
		backgroundColor: '#9a0000'
	},
	Unrated: {
		backgroundColor: 'white'
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
		return <WorkIcon className={ cx( classes.rating, classes[ rating ] ) } title={ rating }>
			{ text }
		</WorkIcon>;
	}
}

@jss( ( $ ) => ( {
	category: {
		'& path': {
			stroke: 'black',
			strokeWidth: '25',
		},
	},

	Gen: {
		backgroundColor: '#77a600'
	},
	'F-F': {
		backgroundColor: '#b80522'
	},
	'M-M': {
		backgroundColor: '#004dc3'
	},
	'F-M': {
		backgroundColor: '#5e033c'
	},
	Multi: {
		backgroundColor: 'green'
	},
	Other: {
		backgroundColor: 'black'
	},
	Unknown: {
		backgroundColor: 'grey'
	},
} ) )
export class Category extends React.PureComponent {
	static displayName = __filename +  ':Category';

	static propTypes = {
		categories: PropTypes.arrayOf( PropTypes.oneOf( [ 'Gen', 'F/F', 'M/M', 'F/M', 'Multi', 'Other' ] ).isRequired ).isRequired,
		classes: PropTypes.object.isRequired,
	}

	static Icons = {
		Gen: { set: 'regular', icon: 'dot-circle' },
		'F-F': { set: 'solid', icon: 'venus' },
		'M-M': { set: 'solid', icon: 'mars' },
		'F-M': { set: 'solid', icon: 'transgender' }, // Yes, I know, but it matches ao3.
		Multi: null,
		Other: { set: 'solid', icon: 'genderless' },
		Unknown: null,
	}

	render() {
		const { categories, classes } = this.props,
			className = ( categories.length > 1 ) ? 'Multi' : ( categories.length <= 0 ) ? 'Unknown' : categories[ 0 ].replace( /\//g, '-' ),
			title = categories.join( ', ' ) || 'Unknown';
		return <WorkIcon className={ cx( classes.category, classes[ className ] ) } title={ title }>
			{ Category.Icons[ className ] &&
				<Icon { ...Category.Icons[ className ] } /> }
		</WorkIcon>;
	}
}

@jss( ( $ ) => ( {
	'archiveofourown-org': {
		backgroundColor: 'red'
	},
	'www-fanfiction-net': {
		backgroundColor: '#303e73'
	},
} ) )
export class Site extends React.PureComponent {
	static displayName = __filename +  ':Site';

	static propTypes = {
		site: Types.workShape.site, // .isRequired
		classes: PropTypes.object.isRequired,
	}

	componentWillMount() {
		window.FontAwesome.library.add( {
			prefix: 'av',
			iconName: 'ff-net',
			icon: [ 180, 180, [], 'f003', 'M 45,49 H 113 V 18 H 14 V 172 H 45 Z M 113,126 H 68 V 172 h 45 z M 168,18 H 137 V 73 H 68 v 29 h 69 V 172 H 168 Z' ],
		} );
		// 'ff-net', [
		// 	180, 180, [], 'f003',
		// 	'M 45,49 H 113 V 18 H 14 V 172 H 45 Z M 113,126 H 68 V 172 h 45 z M 168,18 H 137 V 73 H 68 v 29 h 69 V 172 H 168 Z'
		// ] );
	}

	render() {
		const { site, classes } = this.props;
		// TODO ICON
		return <WorkIcon className={ classes[ site.replace( /\./g, '-' ) ] } title={ site }>
			{ site === 'www.fanfiction.net' &&
				<i className="av fa-ff-net" /> }
		</WorkIcon>;
	}
}


@jss( ( $ ) => ( {
	'One-Shot': {
		backgroundColor: 'green'
	},
	Complete: {
		backgroundColor: 'orange'
	},
	'Multi-Chapter': {
		backgroundColor: 'red'
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
			title = isOneShot ? 'One-Shot' : isComplete ? 'Complete' : 'Multi-Chapter';
		// TODO ICON
		return <WorkIcon className={ classes[ title ] } title={ title }>
			
		</WorkIcon>;
	}
}
