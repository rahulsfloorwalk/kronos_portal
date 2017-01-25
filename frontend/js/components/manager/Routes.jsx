import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';

import ClientList from './ClientList.jsx';
import ClientForm from './ClientForm.jsx';
import ClientDetail from './ClientDetail.jsx';

import StoreForm from './StoreForm.jsx';
import StoreDetail from './StoreDetail.jsx';

import AuditorList from './AuditorList.jsx';
import AuditorDetailsPage from './AuditorDetailsPage.jsx';

import StateList from './StateList.jsx';
import CityList from './CityList.jsx';

import LocationList from './LocationList.jsx';
import LocationForm from './LocationForm.jsx';

import AuditCycleList from './AuditCycleList.jsx';
import AuditCycleForm from './AuditCycleForm.jsx';
import AuditCycleDetails from './AuditCycleDetails.jsx';

import AuditDetails from './AuditDetails.jsx';
import AuditLocationForm from './AuditLocationForm.jsx';

import ApplicationAssignForm from './ApplicationAssignForm.jsx';
import ApplicationRejectForm from './ApplicationRejectForm.jsx';
import ApplicationCompleteForm from './ApplicationCompleteForm.jsx';
import ApplicationFailForm from './ApplicationFailForm.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />

		<Route path="client" component={ClientList}>
			<Route path="add" component={ClientForm}/>
		</Route>

		<Route path="client/:clientId" component={ClientDetail}>
			<Route path="edit" component={ClientForm}/>
			<Route path="store/add" component={StoreForm}/>
			<Route path="audit_cycle/add" component={AuditCycleForm}/>
		</Route>

		<Route path="store/:storeId" component={StoreDetail}>
			<Route path="edit" component={StoreForm}/>
		</Route>

		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="edit" component={AuditCycleForm}/>
		</Route>

		<Route path="auditor" component={AuditorList}/>
		<Route path="auditor/:auditorId" component={AuditorDetailsPage}/>

		<Route path="state" component={StateList}/>
		<Route path="state/:stateId/city" component={CityList}/>
		<Route path="state/:stateId/city/:cityId/location" component={LocationList}>
			<Route path="add" component={LocationForm}/>
			<Route path=":locationId/edit" component={LocationForm}/>
		</Route>
	</Route>
    </Router>
);

/*
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
				<Route path=":applicationId/complete" component={ApplicationCompleteForm}/>
				<Route path=":applicationId/fail" component={ApplicationFailForm}/>
			</Route>
		</Route>
*/

export default Routes;
