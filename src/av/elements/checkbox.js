'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import jss from 'react-jss';
import cx from 'classnames';

import { Icon } from 'av/react-font-awesome';


@jss( ( $ ) => ( {
	base: {

	},
	true: {

	},
	false: {

	}
} ) )
export class Checkbox extends React.PureComponent {
	static displayName = __filename + ':Checkbox';

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		value: PropTypes.bool,
		onClick: PropTypes.func,
		classes: PropTypes.object.isRequired
	}

	@autobind
	onClick() {
		const { value, onClick } = this.props;
		if( onClick ) {
			onClick( !value );
		}
	}

	render() {
		const{ style, className, classes, value } = this.props;
		return <Icon
			icon={ value ? 'check-square' : 'square' }
			className={ cx( classes.base, classes[ !!value ], className ) }
			style={ style }
			onClick={ this.onClick }/>
	}
}

@jss( ( $ ) => ( {
	base: {

	},
	true: {

	},
	false: {

	},
	null: {

	},
} ) )
export class TriCheckbox extends React.PureComponent {
	static displayName = __filename + ':TriCheckbox';

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		disabled: PropTypes.bool,
		value: PropTypes.bool,
		onClick: PropTypes.func,
		classes: PropTypes.object.isRequired
	}

	static defaultProps = {
		value: null
	}

	@autobind
	onClick() {
		const { value, onClick } = this.props;
		if( onClick ) {
			if( value == null ) {
				onClick( true );
			} else if( value ) {
				onClick( false );
			} else {
				onClick( null );
			}
		}
	}

	getIcon( value ) {
		if( value === null ) {
			return 'square';
		} else if( value ) {
			return 'plus-square';
		} else {
			return 'minus-square';
		}
	}

	render() {
		const{ style, className, classes, value } = this.props;
		return <Icon
			icon={ this.getIcon( value ) }
			className={ cx( classes.base, classes[ value ], className ) }
			style={ style }
			onClick={ this.onClick }/>
	}
}
