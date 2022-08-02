import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Link } from "react-router";

import { getDashboardSummaryAuditCycles } from "../service/dashboard_audit_cycles.js";

import AuditCycleDashBoard from "./audit_cycle/AuditCycleDashboard.jsx";

class Dashboard extends React.Component {
	static propTypes = {
		clientId: PropTypes.number,
	};

	constructor(props){
		super(props);
		this.state = {
			summary: {
				completed: 0,
				acknowledge: 0,
				submitted: 0,
				remaining: 0,
				assigned: 0
			},
			loading: false
		};
	}

	componentDidMount() {
		this.setState({loading:true});
		getDashboardSummaryAuditCycles().then((summary)=> this.setState({
			summary: summary,
			loading: false
		}));
	}

	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-12">
						<h3>Audit Summary</h3>
						<hr/>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Total Completed</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.summary.completed}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Total In-Progress</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.summary.acknowledge}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Total QA-Review</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.summary.submitted}
							</div>
						</div>
					</div>
					<div className="col-md-3">
						<div className="panel panel-default">
							<div className="panel-heading text-center">
								<h5 className="panel-title"><b>Total Remaining</b></h5>
							</div>
							<div className="panel-body text-center">
								{this.state.summary.assigned}
							</div>
						</div>
					</div>
				</div>
				<div className="row col-md-12" style={{display:"flex", alignItems: "baseline"}}>
					<h3>Current Projects</h3>
					<hr/>
				</div>
				<div className="row col-md-12 text-right">
					<Link to={"/project_setup/quotation"} className="btn btn-sm btn-primary">Want to conduct audits? Setup your project</Link>
				</div>
				<div className="row col-md-12">
					<AuditCycleDashBoard/>
				</div>
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		clientId: store.client.id,
	};
};

export default connect(mapStoreToProps)(Dashboard);