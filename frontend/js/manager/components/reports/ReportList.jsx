import React from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";

import { Stats } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";

class ReportList extends React.Component {
	static propTypes = {
		children: PropTypes.node,
		can_view_reports: PropTypes.bool,
	};

	render(){
		return(
			<div>
				<h2 className="page-header">
					<Stats/> Reports
				</h2>
				{this.props.can_view_reports ?
					<ul className="nav nav-tabs">
						<NavLink to="/reports/profitablity">PNL</NavLink>
						<NavLink to="/reports/auditor_payment">Auditor Payments</NavLink>
						<NavLink to="/reports/billing">Billing</NavLink>
						<NavLink to="/reports/project_cost">Project Cost</NavLink>
						<NavLink to="/reports/monthly_pnl">Month on month PNL</NavLink>
						<NavLink to="/reports/manager_profit">Project manager</NavLink>
						<NavLink to="/reports/client_profitability">Client Profitability</NavLink>
						<NavLink to="/reports/qa_report">QA Report</NavLink>
						<NavLink to="/reports/qa_report_panel">Submission Summary</NavLink>
						<NavLink to="/reports/qa_performance">QA Performance</NavLink>
					</ul>
					: null}
				<br/>
				{this.props.can_view_reports ? this.props.children : null}
			</div>
		);
	}
}

var mapStateToProps = function(store){
	return {
		can_view_reports: store.permissions.includes("can_view_reports"),
	};
};

export default connect(mapStateToProps)(ReportList);