'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import jss from 'react-jss';

import moment from 'moment';

import * as Types from '../types';


@jss( ( $ ) => ( {
	container: {
		margin: [ $.margin.large, 0 ]
	}
} ) )
export class FFWork extends React.Component {
	static displayName = __filename;

	static propTypes = {
		...Types.ffWorkShape,
		classes: PropTypes.object.isRequired
	}

	render() {
		const { classes, title, author, rating, updated, pairings, characters, summary, words, chapters, complete } = this.props;
		return <div className={ classes.container }>
			<div>{ rating } { title } - { author } { moment.utc( updated, 'X' ).format( 'DD MMM YYYY' ) }</div>
			<div>{ pairings.map( ( p ) => `${p.join( '/' )}` ).concat( characters ).map( ( t ) => <span>{ t }, </span> ) }</div>
			<div>{ summary }</div>
			<div>{ chapters }/{ complete ? chapters : '?' } : { words }</div>
		</div>;
	}
}
