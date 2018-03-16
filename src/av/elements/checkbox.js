'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import autobind from 'autobind-decorator';
import jss from 'react-jss';
import cx from 'classnames';

import { Icon } from 'av/react-font-awesome';


@jss( ( $ ) => ( {
	container: {
		cursor: 'pointer',
		userSelect: 'none',
		color: $.colors.lightest,

		'&.true': {},
		'&.false': {},
	},
} ) )
export class Checkbox extends React.PureComponent {
	static displayName = __filename + ':Checkbox';

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		// disabled: PropTypes.bool,
		value: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
	}

	@autobind
	onChange() {
		const { value, onChange } = this.props;
		onChange( !value );
	}

	render() {
		const{ style, className, classes, value } = this.props,
			icon = value ? 'check-square' : 'square';
		return<div
			key={ value }
			className={ cx( classes.container, String( !!value ), className ) }
			style={ style }
			onClick={ this.onClick }
		><Icon set="regular" size="lg" icon={ icon } /></div>;
	}
}

@jss( ( $ ) => ( {
	container: {
		display: 'flex',
		cursor: 'pointer',
		userSelect: 'none',
		color: $.colors.lightest,

		'& > *:first-child': {
			marginRight: $.margin.small,
		},

		'& > .true': {},
		'& > .false': {},
		'& > .null': {},

		'& > .label': {
			lineHeight: '1.33333em',
		}
	},
} ) )
export class TriCheckbox extends React.PureComponent {
	static displayName = __filename + ':TriCheckbox';

	static propTypes = {
		style: PropTypes.object,
		className: PropTypes.string,
		// disabled: PropTypes.bool,
		value: PropTypes.bool,
		onChange: PropTypes.func.isRequired,
		classes: PropTypes.object.isRequired,
		children: PropTypes.node,
	}

	static defaultProps = {
		value: null
	}

	@autobind
	onClick() {
		const { value, onChange } = this.props;
		if( value == null ) {
			onChange( true );
		} else if( value ) {
			onChange( false );
		} else {
			onChange( null );
		}
	}

	getIcon( value ) {
		if( value == null ) {
			return 'square';
		} else if( value ) {
			return 'plus-square';
		} else {
			return 'minus-square';
		}
	}

	render() {
		const{ style, className, classes, value, children } = this.props,
			icon = this.getIcon( value );
		return <div
			className={ cx( classes.container, className ) }
			style={ style }
			onClick={ this.onClick }
		>
			<Icon dynamic={ value } className={ String( value ) } set="regular" size="lg" icon={ icon } />
			<div className="label">
				{ children }
			</div>
		</div>;
	}
}
