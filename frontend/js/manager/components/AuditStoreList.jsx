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
// import ModeratorAssignDropdown from "./ModeratorAssignDropdownNew.jsx";
import AuditStoreStatusSummary from "./AuditStoreStatusSummary.jsx";
import { findAuditStoresByAuditCycle  } from "../service/audit_store.js";
import { acceptAllReports } from "../service/audit_store.js";
// import { findModerators } from "../service/moderator.js";
import { getAuditStoreStatus } from "../../utils.js";
import { fetchAudits } from "../actions/audit.js";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import { fetchClientModerators } from "../service/client_manager.js";

// const moderatorPropShape = PropTypes.shape({
// 	id: PropTypes.number.isRequired,
// 	email: PropTypes.string.isRequired,
// 	is_active: PropTypes.bool.isRequired,
// });

const moderatorPropShape = PropTypes.shape({
	id: PropTypes.number.isRequired,
	user: PropTypes.shape({
		email: PropTypes.string.isRequired,
		is_active: PropTypes.bool.isRequired,
	}).isRequired,
	is_active: PropTypes.bool.isRequired,
});

const auditStorePropShape = PropTypes.shape({
	id: PropTypes.number.isRequired,
	status: PropTypes.string.isRequired,
	audit: PropTypes.number.isRequired,
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
		let acceptButton = null;
		if(this.props.auditStore.status == "COMPLETED"){
			if(this.props.auditStore.audit.audit_cycle){
				acceptButton = (<Link to={`/audit_cycle/${this.props.auditStore.audit.audit_cycle.id}/audit/audit_store/${this.props.auditStore.id}/accept`} className="btn btn-default">Accept</Link>);
			}
		}
		let auto_approved=this.props.auditStore.auto_assigned ? "(Auto Assigned)" : null;
		let instant_approved=this.props.auditStore.instant_assigned ? "(Instant Assigned)" : null;
		return(

			<tr>
				<td className="text-right">{this.props.auditStore.id}</td>
				<td><AuditorNameDisplay user={this.props.auditStore.user}/></td>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				<td className="text-right">{acceptButton}</td>
				<td>
					{/* <tr>
						<AuditStoreStatusLabel status={this.props.auditStore.status}/> {this.props.auditStore.report_revert_count>0 ? <span><i>Reverted({this.props.auditStore.report_revert_count})</i></span>:null}
					</tr> */}
					<tr>
						<AuditStoreStatusLabel status={this.props.auditStore.status}/>   <span style={{ margin: "6px" }}>{this.props.auditStore.report_completion_percentage ? `(${this.props.auditStore.report_completion_percentage}%)` : null}</span> {this.props.auditStore.report_revert_count>0 ? <span><i>Reverted({this.props.auditStore.report_revert_count})</i></span>:null}
					</tr>
					<tr>
						<td colSpan="10">
							<div style={{marginTop:"4px"}}>
								<i>{auto_approved}{instant_approved}</i>
							</div>
						</td>
					</tr>
				</td>
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
						<th></th>
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
		audits: [],
		auditStores: [],
		selectedStatus: "",
		loading: false,
		moderators: [],
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};
	reloadReports = (auditCycleId) => {
		this.setLoading(true);
		return Promise.all([
			this.props.dispatch(fetchAudits(auditCycleId)),
			findAuditStoresByAuditCycle(auditCycleId),
		]).then(([audits, auditStores]) => {
			this.setState({
				audits,
				auditStores
			});
			this.setLoading(false);
		});
	};
	componentDidMount(){
		// this.reloadReports(this.props.params.auditCycleId);
		// findModerators().then((moderators) => {
		// 	this.setState({ moderators });
		// });
		this.reloadReports(this.props.params.auditCycleId).then(() => {
			const clientId = this.state.auditStores && this.state.auditStores.length > 0
				? this.state.auditStores[0].client_id
				: null;
			if (clientId) {
				fetchClientModerators(clientId).then((moderators) => {
					this.setState({ moderators });
				});
			}
		});
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.params.auditCycleId !== this.props.params.auditCycleId || (nextProps.location.state && nextProps.location.state.reload)){
			this.reloadReports(nextProps.params.auditCycleId);
		}
	}
	statusChanged = (e) => {
		this.setState({
			selectedStatus: e.target.value
		});
	};
	auditStoreUpdated = (auditStore) => {
		let i = this.state.auditStores.findIndex(as => as.id === auditStore.id);
		if( i !== -1){
			let auditStores = this.state.auditStores;
			auditStores[i] = auditStore;
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
	render(){
		let rows = [];
		for( const audit of this.state.audits){
			const reports = this.state.auditStores.
				filter(as => as.audit === audit.id).
				filter(as => this.state.selectedStatus ? as.status === this.state.selectedStatus : true);
			if(reports.length > 0) {
				rows.push(
					<div className="panel panel-default" key={audit.id}>
						<div className="panel-heading">
							<b>{audit.store.name}</b>, {audit.store.address}, {audit.store.city.name}
						</div>
						<AuditStoreTable auditStores={reports}
							selectedStatus={this.state.selectedStatus}
							onUpdate={this.auditStoreUpdated}
							moderators={this.state.moderators}/>
					</div>
				);
			}
		}
		if( !this.state.loading && rows.length === 0){
			rows.push(<Jumbotron key="empty" heading="there are no reports here" para="start by assigning a report from Audits section"/>);
		}
		if(this.state.loading){
			rows.push(<Loading key="loading"/>);
		}
		return(
			<div>
				<br/>
				<AuditStoreStatusSummary auditCycleId={this.props.params.auditCycleId}/>
				<div className="form-group">
					<select className="form-control" style={{display:"inline-block",width:"200px"}} onChange={this.statusChanged} value={this.state.selectedStatus}>
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
				{this.props.children}
			</div>
		);
	}
}

export default ReactRedux.connect()(AuditStoreList);

export { AuditStoreTable, AuditStoreList };
