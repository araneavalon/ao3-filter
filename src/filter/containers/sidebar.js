'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import _ from 'lodash';

import { Accordion, Button, Label, TriCheckbox } from 'av/elements';

import { setStaticFilter, submitFilter } from '../actions';


@connect(
	( { filter } ) => ( {
		filter: _.omit( filter, [ 'terms' ] ),
	} ),
	( dispatch ) => ( {
		setStaticFilter: _.curry( ( name, key, value ) => dispatch( setStaticFilter( name, key, value ) ) ),
		submitFilter: ( filter ) => dispatch( submitFilter( filter ) ),
	} ),
	( { ...s }, { submitFilter, ...a }, p ) => ( {
		...s,
		...a,
		...p,
		submitFilter: () => submitFilter( s.filter ),
	} )
)
export class FilterSidebar extends React.Component {
	static displayName = __filename;

	static propTypes = {
		filter: PropTypes.object.isRequired, // TODO
		setStaticFilter: PropTypes.func.isRequired,
		submitFilter: PropTypes.func.isRequired,
	};

	render() {
		const { filter, setStaticFilter, submitFilter } = this.props;
		return <dl>
			<Button onClick={ submitFilter }>Sort and Filter</Button>
			{ [
				[ 'Ratings', 'rating', [ 'Unrated', 'Explicit', 'Mature', 'Teen', 'General' ] ],
				[ 'Warnings', 'warning', [
					'Creator Chose Not To Use Archive Warnings',
					'No Archive Warnings Apply',
					'Graphic Depictions Of Violence',
					'Major Character Death',
					'Underage',
					'Rape/Non-Con',
				] ],
				[ 'Categories', 'category', [ 'Gen', 'F/F', 'F/M', 'M/M', 'Multi', 'Other' ] ],
			].map( ( [ title, name, keys ] ) => {
				const onChangeFactory = setStaticFilter( name );
				return <Accordion key={ name }>
					{ title }
					<ul>
						{ keys.map( ( key ) =>
							<li key={ key }>
								<TriCheckbox value={ filter[ name ][ key ] } onChange={ onChangeFactory( key ) }>{ key }</TriCheckbox>
							</li> ) }
					</ul>
				</Accordion>;
			} ) }
			<dt><Label>Status</Label></dt>
			<dd>
				<TriCheckbox value={ filter.status.complete } onChange={ setStaticFilter( 'status', 'complete' ) }>Complete</TriCheckbox>
			</dd>
			<Button onClick={ submitFilter }>Sort and Filter</Button>
		</dl>;
	}
}

// Sort and Filter -> turn filter into terms, execute page 1.

// Actions update internal sidebar filter state representation.

// Accordions:
//   Ratings (Tri)
//   Warnings (Tri)
//   Categories (Tri)

// Characters (Text)
// Relationships (Text)
//   + for new set, empty box at end
// Additional Tags (Text)
// Complete (Tri)

// Sort and Filter -> turn filter into terms, execute page 1.
