import React from "react";
import PropTypes from "prop-types";

import { Stats } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";

class ReportList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
	};

	render(){
		return(
			<div>
				<h2 className="page-header">
					<Stats/> Reports
				</h2>
				<ul className="nav nav-tabs">
					<NavLink to="/reports/auditor_payment">Auditor Payments</NavLink>
					<NavLink to="/reports/billing">Billing</NavLink>
					<NavLink to="/reports/profitablity">Profitability</NavLink>
					<NavLink to="/reports/project_cost">Project Cost</NavLink>
				</ul>
				<br/>
				{this.props.children}
			</div>
		);
	}
}

export default ReportList;