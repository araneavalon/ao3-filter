'use strict';

import PropTypes from 'prop-types';

import { tuple } from './tuple';

export * from './make-prop-type';
export * from './prop-type-error';

export default { ...PropTypes, tuple };
