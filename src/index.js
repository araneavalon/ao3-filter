'use strict';

import 'babel-polyfill';
import 'av/fontawesome';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

import { createStore } from './store';
import { App } from './app';

import theme from './theme.json';
import { ThemeProvider } from 'av/jss-theme';

const store = createStore( window.REDUX_INITIAL_STATE );
window.getState = () => store.getState();

ReactDOM.hydrate(
	<ThemeProvider theme={ theme }>
		<ReduxProvider store={ store }>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</ReduxProvider>
	</ThemeProvider>,
	document.getElementById( 'root' )
);
