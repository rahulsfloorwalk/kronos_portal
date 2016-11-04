import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';

import ClientList from './ClientList.jsx';
import ClientForm from './ClientForm.jsx';

import AuditorList from './AuditorList.jsx';
import AuditorDetailsPage from './AuditorDetailsPage.jsx';

import LocationList from './LocationList.jsx';
import LocationForm from './LocationForm.jsx';

import AuditList from './AuditList.jsx';
import AuditDetails from './AuditDetails.jsx';
import AuditForm from './AuditForm.jsx';
import AuditLocationForm from './AuditLocationForm.jsx';

import ApplicationAssignForm from './ApplicationAssignForm.jsx';
import ApplicationRejectForm from './ApplicationRejectForm.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />

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

		<Route path="audit" component={AuditList}>
			<Route path="add" component={AuditForm}/>
		</Route>
		<Route path="audit/:auditId" component={AuditDetails}>
			<Route path="edit" component={AuditForm}/>
			<Route path="auditlocation/add" component={AuditLocationForm}/>
			<Route path="auditlocation/:auditLocationId/edit" component={AuditLocationForm}/>

			<Route path="application/">
				<Route path=":applicationId/assign" component={ApplicationAssignForm}/>
				<Route path=":applicationId/reject" component={ApplicationRejectForm}/>
			</Route>
		</Route>
	</Route>
    </Router>
);

export default Routes;
