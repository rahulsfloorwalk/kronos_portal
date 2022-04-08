/* global process:false */

import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";
import ReduxThunk from "redux-thunk";
import $ from "jquery";
import "@babel/polyfill";
import Raven from "raven-js";

import Routes from "./components/Routes.jsx";
import reducers from "./reducers/index.js";

import "../../bsvendor/css/bootstrap_noprint.min.css";
import "../../css/bs_overrides.scss";
import "../../node_modules/video-react/dist/video-react.css";

import { fetchConfig } from "./service/config.js";
import ReactGA from "react-ga";
import { hashHistory } from "react-router";


let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		alert("It looks like your session has expired, please click 'OK' to login again.");
		window.location.replace("/auth/client/login");
	}
});

const store = createStore(
	reducers,
	applyMiddleware(
		ReduxThunk,
	)
);

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

	ReactGA.initialize(config.GA_ID);
	hashHistory.listen(location => {
		ReactGA.set({ page: location.pathname }); // Update the user's current page
		ReactGA.pageview(location.pathname); // Record a pageview for the given page
	});

	ReactDOM.render(
		<Provider store={store}>
			<Routes store={store}/>
		</Provider>,
		document.getElementById("root")
	);
});
