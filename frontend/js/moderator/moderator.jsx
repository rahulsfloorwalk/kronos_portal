/* global PHOEBE_VERSION:false */

import React from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

import { hashHistory } from 'react-router';

import { fetchConfig } from "./service/config.js";

import Routes from './components/Routes.jsx';

const render = () => {
	ReactDOM.render(
		<Routes/>,
		document.getElementById('root')
	);
}

let forbiddenEncountered = false;
$(document).ajaxError(function(event, jqXHR, settings){
	if(jqXHR.status === 403 && !forbiddenEncountered){
		forbiddenEncountered = true;
		hashHistory.push('/login');
	}
});

// auto reload if client/server versions don't match
$(document).ajaxComplete(function(event, jqXHR, settings){
	if(jqXHR.status === 200 && settings.url.startsWith("/moderator") && jqXHR.getResponseHeader("X-Phoebe-Version") !== PHOEBE_VERSION){
		window.location.reload(true);
	}
});


fetchConfig().then((config) => {
	render();
	if(module.hot){
		console.debug("Module is HOT HOT HOT!");
		module.hot.dispose(function(){
			render();
		});
		module.hot.accept();
	}
}).always(() => render());
