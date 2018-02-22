import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import 'babel-polyfill';
import Raven from "raven-js";

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


fetchConfig().done((config) => {

	// Start Sentry logging if app is not in debug mode
	if(Raven && config.SENTRY_DSN && process.env.NODE_ENV === "production"){
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


	ReactDOM.render(
		<Routes/>,
		document.getElementById('root')
	);
});
