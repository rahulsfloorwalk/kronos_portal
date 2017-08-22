import React from 'react';
import { Router, Route, IndexRoute, hashHistory } from 'react-router';

import App from './App.jsx';

import Dashboard from './Dashboard.jsx';
import { TypedDashboard } from './Dashboard.jsx';

import ReportBrowser from './ReportBrowser.jsx';
import ReportBrowser3 from './ReportBrowser3.jsx';
import StoreDetail from './StoreDetail.jsx';

import AuditStoreList from './AuditStoreList.jsx'; import AuditStoreDetail from './AuditStoreDetail.jsx';

import SectionList from './SectionList.jsx';

import UpcomingAuditStores from './UpcomingAuditStores.jsx';
import TwitterFeed from './TwitterFeed.jsx';

const IndexComponent = React.createClass({
	componentDidMount: function(){
		//console.debug("IndexComponent", "componentDidMount");
		//hashHistory.push("/dashboard");
	},
	render: function(){
		return null;
	}
});

const Routes = () => (
    <Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={IndexComponent}/>

		<Route path="/dashboard" component={Dashboard}>
			<Route path=":auditType" component={TypedDashboard}/>
		</Route>

		<Route path="/browser" component={ReportBrowser}/>
		<Route path="/browser/auditCycle/:auditCycleId/city/:cityId" component={ReportBrowser}/>

		<Route path="/browser3" component={ReportBrowser3}/>

		<Route path="/store/:storeId" component={StoreDetail}>
			<Route path="audit_store" component={AuditStoreList}/>
		</Route>
		<Route path="/audit_store/:auditStoreId" component={AuditStoreDetail}/>
		<Route path="/upcoming" component={UpcomingAuditStores}/>

		<Route path="/twitter" component={TwitterFeed}/>
	</Route>
    </Router>
);

export default Routes;
