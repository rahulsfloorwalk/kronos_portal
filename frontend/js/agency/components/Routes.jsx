import React from "react";
import { Router, Route, IndexRoute, hashHistory } from "react-router";

import App from "./App.jsx";
import Dashboard from "./Dashboard.jsx";

import AgencyDetailsForm from "./AgencyDetailsForm.jsx";

const Routes = () => (
	<Router history={hashHistory}>
		<Route path="/" component={App}>
			<IndexRoute component={Dashboard} />
			<Route path="agency/edit" component={AgencyDetailsForm} />
		</Route>
	</Router>
);

export default Routes;
