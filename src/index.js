'use strict';

import 'babel-polyfill';
import 'av/fontawesome';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';
import { App } from './app';


import theme from './theme.json';
import { ThemeProvider } from 'av/jss-theme';

const store = createStore( reducer, applyMiddleware( thunk ) );
window.getState = () => store.getState();

ReactDOM.render(
	<ThemeProvider theme={ theme }>
		<ReduxProvider store={ store }>
			<App />
		</ReduxProvider>
	</ThemeProvider>,
	document.getElementById( 'root' )
);
