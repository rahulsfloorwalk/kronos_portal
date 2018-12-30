/* global process:false */

import "babel-polyfill";
import promiseFinally from "promise.prototype.finally";
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { combineReducers, createStore, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";
import { } from "react-router";
import Raven from "raven-js";
import ReactGA from "react-ga";
import axios from "axios";

import Routes from "./components/Routes.jsx";

import { fetchConfig } from "./service/config.js";

import auditStoreReducer from "./reducers/audit_store.js";
import reportSectionReducer from "./reducers/report_section.js";
import answerReducer from "./reducers/answer.js";
import sectionReducer from "./reducers/section.js";

promiseFinally.shim();

// add a response interceptor to check for client/server version mismatches
// let forbiddenEncountered = false;
axios.interceptors.response.use((response) => {
	//console.log("LOCAL PHOEBE VERSION:", PHOEBE_VERSION);
	//console.log("AXIOS INTERCEPTOR SUCCESS:", response);
	/*
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		let redirLoc = `/auth/login?next=${encodeURIComponent(window.location.toString())}`;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace(redirLoc);
	}
	//
// auto reload if client/server versions don't match
$(document).ajaxComplete(function(event, jqXHR, settings){
	if(jqXHR.status === 200 && settings.url.startsWith("/auditor") && jqXHR.getResponseHeader("X-Phoebe-Version") !== PHOEBE_VERSION){
		window.location.reload(true);
	}
});

	*/
	return response;
}, (error) => {
	//console.log("AXIOS INTERCEPTOR ERR:", error);
	return Promise.reject(error);
});


let render = store => {
	ReactDOM.render(
		<Provider store={store}>
			<Routes store={store}/>
		</Provider>,
		document.getElementById("root")
	);
};

const reducers = combineReducers({
	auditStores: auditStoreReducer,
	reportSections: reportSectionReducer,
	answers: answerReducer,
	sections: sectionReducer,
});

let store = createStore(
	reducers,
	applyMiddleware(
		ReduxThunk,
	)
);

render(store);

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

	ReactGA.initialize(config.GA_ID);

}).catch((err) => {
	if(err.response && err.response.status === 403){
		window.location.replace("/auth/agency/login");
	}
});

