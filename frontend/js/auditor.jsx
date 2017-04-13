import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import * as Redux from 'redux';
import ReduxThunk from 'redux-thunk';
import ReduxLogger from 'redux-logger';

import $ from 'jquery';

import Routes from './components/auditor/Routes.jsx';
import { rootReducer } from './reducers_auditor.js';

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace("/auth/login");
	}
});


var store = Redux.createStore(
	rootReducer,
	Redux.applyMiddleware(
		ReduxThunk,
		//ReduxLogger()
	)
);

ReactDOM.render(
	<Provider store={store}>
		<Routes store={store}/>
	</Provider>,
	document.getElementById('root')
);
