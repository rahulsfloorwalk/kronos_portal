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

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		let redirLoc = `/auth/login?next=${encodeURIComponent(window.location.toString())}`;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace(redirLoc);
	}
});

fetchConfig().then((config) => {
	if(config.TAWK_TO_SRC){
		//Start of Tawk.to Script
		let Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
		(function(){
			let s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
			s1.async=true;
			s1.src=config.TAWK_TO_SRC;
			s1.charset='UTF-8';
			s1.setAttribute('crossorigin','*');
			s0.parentNode.insertBefore(s1,s0);
		})();
		//End of Tawk.to Script
	}

	ReactGA.initialize(config.GA_ID);

	let store = Redux.createStore(
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
});

