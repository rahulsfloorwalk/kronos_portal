import React from "react";
import ReactDOM from "react-dom";
import { Router, Route, hashHistory } from "react-router";
import "@babel/polyfill";
import AuditStoreDetail from "./components/audit_store/AuditStoreDetail.jsx";

import "../../bsvendor/css/bootstrap_noprint.min.css";
import "../../css/bs_overrides.scss";

ReactDOM.render(
	<Router history={hashHistory}>
		<Route path="/:auditStoreId" printMode={true} component={AuditStoreDetail}/>
	</Router>,
	document.getElementById("root")
);
