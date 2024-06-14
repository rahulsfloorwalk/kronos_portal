import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import App from "./App.jsx";

import Dashboard from "./Dashboard.jsx";

import ReportBrowser3 from "./ReportBrowser3.jsx";
import StoreDetail from "./StoreDetail.jsx";
import StoreTrends from "./StoreTrends.jsx";
import StoreList2 from "./StoreList2.jsx";
import StoreAuditStoreList from "./store/StoreAuditStoreList.jsx";
import ProofComparison from "./store/ProofComparison.jsx";
import WeightedBrowser from "./WeightedBrowser.jsx";

import AuditStoreDetail from "./audit_store/AuditStoreDetail.jsx";

import UpcomingAuditStores from "./UpcomingAuditStores.jsx";
import TwitterFeed from "./TwitterFeed.jsx";

import StorePerformanceCount from "./StorePerformanceCount.jsx";
import StorePerformanceStoreList from "./StorePerformanceStoreList.jsx";

import ActionReports from "./ActionReports.jsx";

import EmailNotification from "./EmailNotification.jsx";
import AIinsights from "./AIinsights.jsx";
import AIinsightModal from "./AiinsightModal.jsx";

const IndexComponent = () => null;

const Routes = () => (<Router history={hashHistory}>
	<Route path="/" component={App}>
		<IndexRoute component={IndexComponent}/>

		<Route path="/dashboard" component={Dashboard}/>

		<Route path="/browser3" component={ReportBrowser3}/>

		<Route path="/weighted_browser" component={WeightedBrowser}/>

		<Route path="/store" component={StoreList2}/>
		<Route path="/store/:storeId" component={StoreDetail}>
			<Route path="trends" component={StoreTrends}/>
			<Route path="reports" component={StoreAuditStoreList}/>
			<Route path="proof_comparison" component={ProofComparison}/>
		</Route>
		<Route path="/audit_store/:auditStoreId" component={AuditStoreDetail}/>
		<Route path="/upcoming" component={UpcomingAuditStores}/>

		<Route path="store_performance" component={StorePerformanceCount}>
			<Route path="audit_cycle/:audit_cycle_id/section/:section_id/percentage/:percentage/store_list" component={StorePerformanceStoreList}/>
		</Route>
		<Route path="/twitter" component={TwitterFeed}/>
		<Route path="aiinsights" component={AIinsights}>
			<Route path="analysis/:summaryId" component={AIinsightModal}/>
		</Route>
		<Route path="/action_reports" component={ActionReports}/>
		<Route path="/email_notification" component={EmailNotification}/>
	</Route>
</Router>);

export default Routes;
