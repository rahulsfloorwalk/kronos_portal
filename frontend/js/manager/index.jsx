/* global PHOEBE_VERSION:false process:false module:false */

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";

import * as Redux from "redux";
import ReduxThunk from "redux-thunk";
import ReduxLogger from "redux-logger";
import Raven from "raven-js";

import $ from "jquery";

import Routes from "./components/Routes.jsx";
import rootReducer from "./reducers.js";

import { fetchConfig } from "./service/config";

import "../../css/bs_overrides.scss";

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR){
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

let store = Redux.createStore(
	rootReducer,
	Redux.applyMiddleware(
		ReduxThunk,
		ReduxLogger()
	)
);

const render = store => {
	ReactDOM.render(
		<Provider store={store}>
			<Routes store={store}/>
		</Provider>,
		document.getElementById("root")
	);
};

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

	render(store);
	if(module.hot){
		module.hot.dispose(function(){
			render(store);
		});
		module.hot.accept();
	}
}).always(() => render(store));

if(module.hot){
	module.hot.dispose(function(){
		render(store);
	});
	module.hot.accept();
}
