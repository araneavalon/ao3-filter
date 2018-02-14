'use strict';

import PropTypes from 'av/prop-types';


const workShape = {
	site: PropTypes.oneOf( [ 'www.fanfiction.net', 'archiveofourown.org' ] ),
	id: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	authors: PropTypes.arrayOf( PropTypes.tuple( [ PropTypes.string.isRequired, PropTypes.string.isRequired ] ).isRequired ).isRequired,
	summary: PropTypes.string.isRequired,
	language: PropTypes.string.isRequired,
	rating: PropTypes.oneOf( [ 'General', 'Teen', 'Mature', 'Explicit', 'Unrated' ] ).isRequired,
	updated: PropTypes.number.isRequired,
	published: PropTypes.number.isRequired,
	chapters: PropTypes.tuple( [ PropTypes.number.isRequired, PropTypes.number ] ).isRequired,
	words: PropTypes.number.isRequired,
	hits: PropTypes.number,
	kudos: PropTypes.number,
	subscriptions: PropTypes.number,
	comments: PropTypes.number,
	bookmarks: PropTypes.number,
	tags: PropTypes.arrayOf( PropTypes.oneOfType( [
		PropTypes.exact( {
			type: PropTypes.oneOf( [ 'relationship' ] ).isRequired,
			characters: PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired,
		} ).isRequired,
		PropTypes.exact( {
			type: PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		} ).isRequired,
	] ).isRequired ).isRequired,
	series: PropTypes.arrayOf( PropTypes.tuple( [
		PropTypes.number.isRequired, // Part
		PropTypes.string.isRequired, // Name
		PropTypes.number.isRequired, // Id
	] ) ).isRequired,
	errors: PropTypes.arrayOf( PropTypes.string.isRequired ).isRequired,
};

const work = PropTypes.shape( workShape );
const works = PropTypes.arrayOf( work.isRequired );

export {
	workShape,
	work,
	works
};
