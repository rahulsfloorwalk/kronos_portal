import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, hashHistory } from "react-router";
import $ from "jquery";
import "babel-polyfill";
import AuditStoreDetail from "./components/audit_store/AuditStoreDetail.jsx";

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/:auditStoreId" printMode={true} component={AuditStoreDetail}/>
	</Router>,
	document.getElementById("root")
);
