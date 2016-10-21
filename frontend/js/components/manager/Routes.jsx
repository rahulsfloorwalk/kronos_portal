import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';

import ClientList from './ClientList.jsx';
import ClientForm from './ClientForm.jsx';

import AuditorList from './AuditorList.jsx';
import AuditorDetailsPage from './AuditorDetailsPage.jsx';

import LocationList from './LocationList.jsx';
import LocationForm from './LocationForm.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>

		<Route path="client" component={ClientList}>
			<Route path="add" component={ClientForm}/>
			<Route path=":clientId/edit" component={ClientForm}/>
		</Route>

		<Route path="auditor" component={AuditorList}/>
		<Route path="auditor/:auditorId" component={AuditorDetailsPage}/>

		<Route path="location" component={LocationList}>
			<Route path="add" component={LocationForm}/>
			<Route path=":locationId/edit" component={LocationForm}/>
		</Route>
	</Route>
    </Router>
);

export default Routes;
