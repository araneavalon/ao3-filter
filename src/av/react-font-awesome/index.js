'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';


const SETS = {
	av: 'av',
	regular: 'far',
	solid: 'fas',
	light: 'fal'
};

// TODO:
// 	Implement Masks
// 	Implement Layers
//		Implement Layers Text
//		Implement Layers Counter
// 	Possibly PropTypes for transform

export class Icon extends React.Component {
	static propTypes = {
		set: PropTypes.oneOf( [ 'av', 'regular', 'solid', 'light' ] ).isRequired,
		icon: PropTypes.string.isRequired,
		className: PropTypes.string,
		dynamic: PropTypes.any,
		fixedWidth: PropTypes.bool,
		size: PropTypes.oneOf( [ 'xs', 'sm', 'lg', '2x', '3x', '4x', '5x', '6x', '7x', '8x', '9x', '10x' ] ),
		border: PropTypes.bool,
		pull: PropTypes.oneOf( [ 'left', 'right' ] ),
		spin: PropTypes.bool,
		pulse: PropTypes.bool,
		title: PropTypes.string,
		transform: PropTypes.oneOfType( [
			PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired,
			PropTypes.string.isRequired
		] )
	}

	static defaultProps = {
		type: 'regular'
	}

	render() {
		const {
			set,
			icon,
			className,
			dynamic,
			fixedWidth,
			size,
			border,
			pull,
			spin,
			pulse,
			title,
			transform,
			...props
		} = this.props;

		const faClassNames = cx( [
			SETS[ set ],
			'fa-' + icon,
			fixedWidth && 'fa-fw',
			size && 'fa-' + size,
			border && 'fa-border',
			pull && 'fa-pull-' + pull,
			spin && 'fa-spin',
			pulse && 'fa-pulse'
		] );

		const dataFaTransform = Array.isArray( transform ) ?
			transform.join( ' ' ) :
			transform;

		return <span key={ dynamic } className={ className }>
			<i
				className={ faClassNames }
				title={ title }
				data-fa-transform={ dataFaTransform }
				{ ...props } />
		</span>;
	}
}
