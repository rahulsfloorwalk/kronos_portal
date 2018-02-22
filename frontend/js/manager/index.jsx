/* global PHOEBE_VERSION:false */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import $ from 'jquery';

import Routes from './components/Routes.jsx';
import { rootReducer } from './reducers.js';

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace("/auth/manager/login");
	}
});

// auto reload if client/server versions don't match
$(document).ajaxComplete(function(event, jqXHR, settings){
	if(jqXHR.status === 200 && settings.url.startsWith("/manager") && jqXHR.getResponseHeader("X-Phoebe-Version") !== PHOEBE_VERSION){
		window.location.reload(true);
	}
});

var store = Redux.createStore(
	rootReducer,
	Redux.applyMiddleware(
		ReduxThunk,
		ReduxLogger()
	)
);

let render = store => {
	ReactDOM.render(
		<Provider store={store}>
			<Routes store={store}/>
		</Provider>,
		document.getElementById('root')
	);
}
render(store);
if(module.hot){
	console.log("module is HOT HOT HOT!", module);
	module.hot.dispose(function(){
		render(store);
	});
	module.hot.accept();
}
