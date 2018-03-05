'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import * as Types from '../types';

import { Link } from 'av/elements';


export class Stat extends React.Component {
	static displayName = __filename;

	static propTypes = {
		className: PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		formatType: PropTypes.oneOf( [ 'string', 'number', 'chapters' ] ).isRequired,
		value: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number, Types.workShape.chapters ] ).isRequired,
		href: PropTypes.string,
	};

	getValue( value = this.props.value, formatType = this.props.formatType ) {
		switch( formatType ) {
			case 'chapters':
				return [
					this.getValue( value[ 0 ], 'number' ),
					( value[ 1 ] == null ) ? '?' : this.getValue( value[ 1 ], 'number' ),
				].join( '/' );
			case 'number':
				return Number( value ).toLocaleString();
			case 'string':
			default:
				return value;
		}
	}

	render() {
		const { className, name, href } = this.props,
			value = this.getValue();
		return <span className={ cx( 'stat', className ) }>
			<dt>{ name }: </dt>
			<dd>{ ( href == null ) ? value : <Link className="light" href={ href }>{ value }</Link> }</dd>
		</span>
	}
}
