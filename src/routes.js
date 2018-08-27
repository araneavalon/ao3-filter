'use strict';

import { Searches } from 'searches';
import { Works } from 'works';

export default [ {
	path: '/searches',
	component: Searches,
	exact: true,
}, {
	path: '/works/:page',
	component: Works,
	exact: true,
} ];
