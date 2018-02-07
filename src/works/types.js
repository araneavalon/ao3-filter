'use strict';

import PropTypes from 'prop-types';


const ao3WorkShape = {
	type: PropTypes.oneOf( [ 'ao3' ] ),
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired,
};
const ffWorkShape = {
	type: PropTypes.oneOf( [ 'ff' ] ),
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	author: PropTypes.string.isRequired,
	summary: PropTypes.string.isRequired,
	rating: PropTypes.oneOf( [ 'K', 'K+', 'T', 'M' ] ).isRequired,
	updated: PropTypes.number.isRequired,
	published: PropTypes.number.isRequired,
	pairings: PropTypes.arrayOf( PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired ).isRequired,
	characters: PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired,
	words: PropTypes.number.isRequired,
	chapters: PropTypes.number.isRequired,
	complete: PropTypes.bool,
};

const ao3Work = PropTypes.shape( ao3WorkShape );
const ffWork = PropTypes.shape( ffWorkShape );

const work = PropTypes.oneOfType( [ ao3Work, ffWork ] );
const works = PropTypes.arrayOf( work.isRequired );

export {
	ao3WorkShape,
	ao3Work,
	ffWorkShape,
	ffWork,
	work,
	works
};
