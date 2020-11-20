import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import Alert from "react-s-alert";

import moment from "moment";
import { momentDateFormat}  from "../../../config.js";

import Jumbotron from "../../components/Jumbotron.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import Loading from "../../components/Loading.jsx";

import ModeratorAssignDropdown from "./ModeratorAssignDropdown.jsx";
import AuditStoreStatusSummary from "./AuditStoreStatusSummary.jsx";
import { findAuditStoresByAuditCycleNew  } from "../service/audit_store.js";
import { acceptAllReports } from "../service/audit_store.js";
import { findModerators } from "../service/moderator.js";
import { getAuditStoreStatus } from "../../utils.js";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";

const moderatorPropShape = PropTypes.shape({
	id: PropTypes.number.isRequired,
	email: PropTypes.string.isRequired,
	is_active: PropTypes.bool.isRequired,
});

const auditStorePropShape = PropTypes.shape({
	id: PropTypes.number.isRequired,
	status: PropTypes.string.isRequired,
	audit_date: PropTypes.string.isRequired,
	user: PropTypes.shape({
		id: PropTypes.number.isRequired,
		email: PropTypes.string.isRequired,
		profileinfo: PropTypes.shape({
			first_name: PropTypes.string,
			last_name: PropTypes.string,
			mobile_number: PropTypes.string,
		}),
	}),
	assigned_to_moderator: PropTypes.arrayOf(PropTypes.number),
});

class AuditStoreRow extends React.Component {
	static propTypes = {
		auditStore: auditStorePropShape.isRequired,
		moderators: PropTypes.arrayOf(moderatorPropShape),
		onUpdate: PropTypes.func.isRequired,
	};
	state = {};
	render() {
		// let acceptButton = null;
		// if(this.props.auditStore.status == "COMPLETED"){
		// 	if(this.props.auditStore.audit.audit_cycle){
		// 		acceptButton = (<Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit/audit_store/${this.props.auditStore.id}/accept`} className="btn btn-default">Accept</Link>);
		// 	}
		// }
		return(
			<tr>
				<td className="text-right">{this.props.auditStore.id}</td>
				<td><AuditorNameDisplay user={this.props.auditStore.user}/></td>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				{/* <td className="text-right">{acceptButton}</td> */}
				<td><AuditStoreStatusLabel status={this.props.auditStore.status}/></td>
				<td><ModeratorAssignDropdown moderators={this.props.moderators} selectedModeratorId={this.props.auditStore.assigned_to_moderator} auditStoreId={this.props.auditStore.id} onUpdate={this.props.onUpdate}/></td>
				<td>
					<Link to={`/audit_store/${this.props.auditStore.id}/report`} className="btn btn-default">View</Link>
				</td>
			</tr>
		);
	}
}

class AuditStoreTable extends React.Component {
	static propTypes = {
		auditStores: PropTypes.arrayOf(auditStorePropShape),
		moderators: PropTypes.arrayOf(moderatorPropShape),

		onUpdate: PropTypes.func.isRequired,
	};
	render() {
		let reps = [];
		for(let n in this.props.auditStores){
			reps.push(<AuditStoreRow auditStore={this.props.auditStores[n]} key={n} onUpdate={this.props.onUpdate} moderators={this.props.moderators}/>);
		}
		if( reps.length === 0){
			reps.push(<tr key="empty"><td colSpan={5} className="text-center text-muted">no reports here.. check your filters?</td></tr>);
		}
		return(
			<table className="table table-striped">
				<thead>
					<tr>
						<th className="text-right">Report ID</th>
						<th>Auditor Name</th>
						<th>Audit Date</th>
						{/* <th></th> */}
						<th>Report Status</th>
						<th>Assigned To</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{reps}
				</tbody>
			</table>
		);
	}
}

class AuditStoreList extends Component{
	static propTypes = {
		params: PropTypes.shape({
			auditCycleId: PropTypes.string.isRequired,
		}).isRequired,
		location: PropTypes.shape({
			state: PropTypes.shape({
				reload: PropTypes.bool,
			}),
		}),

		children: PropTypes.node,
		dispatch: PropTypes.func.isRequired,
	};

	state = {
		auditStores: [],
		loading: false,
		moderators: [],
		filterReports: [],
		filterStatus: "",
		totalAuditStoreCount: 0,
		loadMoreLoader: false
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};
	reloadReports = (auditCycleId) => {
		this.setLoading(true);
		let lastAuditId="";
		let status="";
		findAuditStoresByAuditCycleNew(auditCycleId, {lastAuditId, status}).then((response) => {
			this.setState({
				auditStores: response.audit_store_list,
				totalAuditStoreCount: response.total_audit_count
			});
			this.setLoading(false);
		});
	};
	componentDidMount(){
		this.reloadReports(this.props.params.auditCycleId);
		findModerators().then((moderators) => {
			this.setState({ moderators });
		});
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.params.auditCycleId !== this.props.params.auditCycleId || (nextProps.location.state && nextProps.location.state.reload)){
			this.reloadReports(nextProps.params.auditCycleId);
		}
	}
	statusChanged = (e) => {
		let status = e.target.value;
		let lastAuditId = "";
		this.setState({
			filterStatus: status,
			auditStores: []
		});
		this.setLoading(true);
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status}).then((response) => {
			this.setState({
				auditStores: response.audit_store_list,
				totalAuditStoreCount: response.total_audit_count
			});
			this.setLoading(false);
		});
	};
	auditStoreUpdated = (auditStore) => {
		let audit_index = null;
		let report_index = null;
		let break_check = false;
		let audit_index_count = 0;
		for(let report of this.state.auditStores){
			let report_index_count = 0;
			for(let rep of report.reports){
				if(rep.id === auditStore.id){
					audit_index = audit_index_count;
					report_index = report_index_count;
					break_check = true;
					break;
				}
				report_index_count += 1;
			}
			if(break_check){
				break;
			}
			audit_index_count += 1;
		}
		if(audit_index !== null){
			let auditStores = this.state.auditStores;
			auditStores[audit_index].reports[report_index] = auditStore;
			this.setState({
				auditStores: auditStores,
			});
		}
	};
	acceptAllClicked = () => {
		if(confirm("Accept all reports with default Audit Fees and Reimbursement?")){
			acceptAllReports(this.props.params.auditCycleId).then((count) => {
				Alert.success(`${count} REPORTS ACCEPTED`);
				this.reloadReports(this.props.params.auditCycleId);
			});
		}
	};
	loadMoreReports = () => {
		this.setState({
			loadMoreLoader: true
		});
		let lastAuditId= this.state.auditStores[this.state.auditStores.length-1].id;
		let status = this.state.filterStatus;
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status}).then((response) => {
			let newAuditStores = this.state.auditStores;
			for(let reports of response.audit_store_list){
				newAuditStores.push(reports);
			}
			this.setState({
				auditStores: newAuditStores,
				loadMoreLoader: false
			});
		});
	};
	render(){
		let rows = [];
		let loadMoreButton;
		let loadMoreLoading;
		if(this.state.loadMoreLoader){
			loadMoreLoading = (<Loading/>);
		}
		let reports = this.state.auditStores;
		if(reports.length > 0){
			for(let report of reports){
				let audit_report_rows = [];
				if(report.reports.length > 0){
					audit_report_rows.push(
						<AuditStoreTable auditStores={report.reports}
							key={report.id}
							onUpdate={this.auditStoreUpdated}
							moderators={this.state.moderators}/>
					);
				}
				if(audit_report_rows.length > 0){
					rows.push(
						<div className="panel panel-default" key={report.id}>
							<div className="panel-heading">
								<b>{report.store_name}</b>, {report.store_address}, {report.store_city}
							</div>
							{audit_report_rows}
						</div>
					);
				}
			}
			if(reports.length !== this.state.totalAuditStoreCount){
				loadMoreButton = (<button className="btn btn-default" onClick={this.loadMoreReports}>
					Load More
				</button>);
			}
		}
		if( !this.state.loading && rows.length === 0){
			rows.push(<Jumbotron key="empty" heading="there are no reports here" para="start by assigning a report from Audits section or reset status filter"/>);
		}
		if(this.state.loading){
			rows.push(<Loading key="loading"/>);
		}
		return(
			<div>
				<br/>
				<AuditStoreStatusSummary auditCycleId={this.props.params.auditCycleId}/>
				<div className="form-group">
					<select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.statusChanged}>
						<option value="">All Status</option>
						<option value="ASSIGNED">{getAuditStoreStatus("ASSIGNED")}</option>
						<option value="ACKNOWLEDGED">{getAuditStoreStatus("ACKNOWLEDGED")}</option>
						<option value="SUBMITTED">{getAuditStoreStatus("SUBMITTED")}</option>
						<option value="PM_REVIEW">{getAuditStoreStatus("PM_REVIEW")}</option>
						<option value="WITHDRAWN">{getAuditStoreStatus("WITHDRAWN")}</option>
						<option value="AUDITOR_WITHDRAWN">{getAuditStoreStatus("AUDITOR_WITHDRAWN")}</option>
						<option value="COMPLETED">{getAuditStoreStatus("COMPLETED")}</option>
						<option value="FAILED">{getAuditStoreStatus("FAILED")}</option>
						<option value="ACCEPTED">{getAuditStoreStatus("ACCEPTED")}</option>
						<option value="REJECTED">{getAuditStoreStatus("REJECTED")}</option>
					</select>
					<span className="pull-right">
						<button className="btn btn-default" onClick={this.acceptAllClicked}>
							Accept All
						</button>
					</span>
				</div>
				{rows}
				<div className="text-center">
					{loadMoreLoading}
					{loadMoreButton}
				</div>
				{this.props.children}
			</div>
		);
	}
}

export default ReactRedux.connect()(AuditStoreList);

export { AuditStoreTable, AuditStoreList };
