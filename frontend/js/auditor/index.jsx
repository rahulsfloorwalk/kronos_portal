/* global PHOEBE_VERSION:false */

import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import Raven from "raven-js";

import ReactGA from 'react-ga';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import $ from 'jquery';

import Routes from './components/Routes.jsx';
import { rootReducer } from './reducers.js';

import { fetchConfig } from './service/config.js';

import { initializeTawk } from './service/tawk.js';

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		let redirLoc = `/auth/login?next=${encodeURIComponent(window.location.toString())}`;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace(redirLoc);
	}
});

// auto reload if client/server versions don't match
$(document).ajaxComplete(function(event, jqXHR, settings){
	if(jqXHR.status === 200 && settings.url.startsWith("/auditor") && jqXHR.getResponseHeader("X-Phoebe-Version") !== PHOEBE_VERSION){
		window.location.reload(true);
	}
});

let render = store => {
	ReactDOM.render(
		<Provider store={store}>
			<Routes store={store}/>
		</Provider>,
		document.getElementById('root')
	);
}

fetchConfig().then((config) => {

	// Start Sentry logging if app is not in debug mode
	if(config.SENTRY_DSN && process.env.NODE_ENV === "production"){
		Raven.config(config.SENTRY_DSN, {
			release: config.PHOEBE_VERSION,
		}).install();

		//set the user context to identify the user
		Raven.setUserContext({
			user_email: config.USER_EMAIL,
			user_id: config.USER_ID,
			phoebe_version: config.PHOEBE_VERSION,
		});
	}

	config.TAWK_TO_SRC && initializeTawk(window, config.TAWK_TO_SRC);

	ReactGA.initialize(config.GA_ID);

	let store = Redux.createStore(
		rootReducer,
		Redux.applyMiddleware(
			ReduxThunk,
			//ReduxLogger()
		)
	);

	render(store);
	if(module.hot){
		console.log("module is HOT HOT HOT!", module);
		module.hot.dispose(function(){
			render(store);
		});
		module.hot.accept();
	}
});

