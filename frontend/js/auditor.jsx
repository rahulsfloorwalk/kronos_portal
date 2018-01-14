import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import ReactGA from 'react-ga';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import $ from 'jquery';

import Routes from './components/auditor/Routes.jsx';
import { rootReducer } from './reducers_auditor.js';

import { fetchConfig } from './auditor/service/config.js';

import { initializeTawk } from './auditor/service/tawk.js';

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		let redirLoc = `/auth/login?next=${encodeURIComponent(window.location.toString())}`;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace(redirLoc);
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

