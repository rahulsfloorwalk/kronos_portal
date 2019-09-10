import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import App from "./App.jsx";
import Login from "./Login.jsx";

import AuditStoreDetails from "./AuditStoreDetails.jsx";
import AuditStoreDashboard from "./AuditStoreDashboard.jsx";

import AuditStoreQARatingForm from "./AuditStoreQARatingForm.jsx";
import AuditStoreEarningsPerAuditForm from "./AuditStoreEarningsPerAuditForm.jsx";
import AuditStoreReimbursementForm from "./AuditStoreReimbursementForm.jsx";
import AttachmentEditForm from "./AttachmentEditForm.jsx";

const Routes = () => (
	<Router history={hashHistory}>
		<Route path="/login" component={Login}/>
		<Route path="/" component={App}>
			<IndexRoute component={AuditStoreDashboard} />
			{/*
		<Route path="audit_cycle/:auditCycleId" component={AuditCycleDetails}>
			<Route path="audit_store" component={AuditStoreList}/>
		</Route>
		*/}
			<Route path="audit_store/:auditStoreId/report" component={AuditStoreDetails}>
				<Route path="rate" component={AuditStoreQARatingForm}/>
				<Route path="earnings_per_audit" component={AuditStoreEarningsPerAuditForm}/>
				<Route path="reimbursement" component={AuditStoreReimbursementForm}/>
			</Route>
			<Route path="/:attachmentId/edit" component={AttachmentEditForm}/>
		</Route>
		
	</Router>
);

export default Routes;
