import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'babel-polyfill';

import Routes from './components/Routes.jsx';

import { fetchConfig } from './service/config.js';

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace("/auth/client/login");
	}
});


fetchConfig().then((config) => {

	ReactDOM.render(
		<Routes/>,
		document.getElementById('root')
	);
});
