import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';

import Dashboard from './Dashboard.jsx';

import ReportBrowser from './ReportBrowser.jsx';
import StoreDetail from './StoreDetail.jsx';

import AuditStoreList from './AuditStoreList.jsx';
import AuditStoreDetail from './AuditStoreDetail.jsx';

import SectionList from './SectionList.jsx';

import UpcomingAuditStores from './UpcomingAuditStores.jsx';

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>

		<IndexRoute component={Dashboard} />
		<Route path="/dashboard/:auditType" component={Dashboard}/>

		<Route path="/browser" component={ReportBrowser}/>
		<Route path="/browser/auditCycle/:auditCycleId/city/:cityId" component={ReportBrowser}/>

		<Route path="/store/:storeId" component={StoreDetail}>
			<Route path="audit_store" component={AuditStoreList}/>
		</Route>
		<Route path="/audit_store/:auditStoreId" component={AuditStoreDetail}/>
		<Route path="/upcoming" component={UpcomingAuditStores}/>
	</Route>
    </Router>
);

export default Routes;
