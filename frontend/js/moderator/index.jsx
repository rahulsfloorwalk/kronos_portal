/* global PHOEBE_VERSION:false */

import "babel-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import $ from "jquery";
import Raven from "raven-js";

import { hashHistory } from "react-router";

import { fetchConfig } from "./service/config.js";

import Routes from "./components/Routes.jsx";

const render = () => {
	ReactDOM.render(
		<Routes/>,
		document.getElementById("root")
	);
};

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		hashHistory.push("/login");
	}
});

// auto reload if client/server versions don't match
$(document).ajaxComplete(function(event, jqXHR, settings){
	if(jqXHR.status === 200 && settings.url.startsWith("/moderator") && jqXHR.getResponseHeader("X-Phoebe-Version") !== PHOEBE_VERSION){
		window.location.reload(true);
	}
});


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

	render();
	if(module.hot){
		console.log("Module is HOT HOT HOT!");
		module.hot.dispose(function(){
			render();
		});
		module.hot.accept();
	}
}).always(() => render());
