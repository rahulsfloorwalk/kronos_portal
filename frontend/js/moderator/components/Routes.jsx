import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';
import Dashboard from './Dashboard.jsx';
import Login from './Login.jsx';

import AuditCycleDetails from './AuditCycleDetails.jsx';
import AuditStoreList from './AuditStoreList.jsx';
import AuditStoreDetails from './AuditStoreDetails.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/login" component={Login}/>
	<Route path="/" component={App}>
		<IndexRoute component={Dashboard} />
		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="audit_store" component={AuditStoreList}/>
		</Route>
		<Route path="audit_store/:auditStoreId/report" component={AuditStoreDetails}>
		</Route>
	</Route>
    </Router>
);

export default Routes;
