import React, { Component } from "react";
import PropTypes from "prop-types";
import * as ReactRedux from "react-redux";
import { Link } from "react-router";

import Alert from "react-s-alert";

import Datetime from "react-datetime";

import moment from "moment";
import { momentDateFormat}  from "../../../config.js";

import Jumbotron from "../../components/Jumbotron.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import Loading from "../../components/Loading.jsx";

import ModeratorAssignDropdown from "./ModeratorAssignDropdown.jsx";
import AuditStoreStatusSummary from "./AuditStoreStatusSummary.jsx";
import { findAuditStoresByAuditCycleNew, getUserList } from "../service/audit_store.js";
import { acceptAllReports } from "../service/audit_store.js";
import { findModerators } from "../service/moderator.js";
import { getAuditStoreStatus } from "../../utils.js";
import { findAuditStoresByAuditCycleReportList,findAuditStoresCityByAuditCycleReportList } from "../service/audit_store.js";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";
import "../../../css/bs_overrides.scss";

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
		let auto_approved=this.props.auditStore.auto_assigned ? "(Auto Assigned)" : null;
		let instant_approved=this.props.auditStore.instant_assigned ? "(Instant Assigned)" : null;
		return(
			<tr>
				<td className="text-right">{this.props.auditStore.id}</td>
				<td><AuditorNameDisplay user={this.props.auditStore.user}/></td>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				{/* <td className="text-right">{acceptButton}</td> */}
				<td>
					<tr>
						<AuditStoreStatusLabel status={this.props.auditStore.status}/> {this.props.auditStore.report_revert_count>0 ? <span><i>Reverted({this.props.auditStore.report_revert_count})</i></span>:null}
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
					<Link to={`/audit_store/${this.props.auditStore.id}/report`} className="btn btn-default" target="_blank">View</Link>
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
		userList: [],
		cityList: [],
		filterStatus: "",
		userId: "",
		city: "",
		totalAuditStoreCount: 0,
		loadMoreLoader: false,
		start_date: "",
		end_date: "",
		visibleReports: [],
		auditReportRows: [],
	};

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};
	reloadReports = (auditCycleId) => {
		this.setLoading(true);
		let lastAuditId="";
		let status="";
		let userId= "";
		let city= "";
		let start_date = "";
		let end_date = "";
		findAuditStoresByAuditCycleNew(auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
			this.setState({
				auditStores: response.audit_store_list,
				totalAuditStoreCount: response.total_audit_count
			});
			this.setLoading(false);
		});
	};
	componentDidMount(){
		// let lastAuditId="";
		// let status="";
		// let userId= "";
		// let start_date = "";
		// let end_date = "";
		// findAuditStoresByAuditCycleNew(auditCycleId, {lastAuditId, status, userId, start_date, end_date})
		this.reloadReports(this.props.params.auditCycleId);
		findModerators().then((moderators) => {
			this.setState({ moderators });
		});
		getUserList(this.props.params.auditCycleId).then((userList) => {
			this.setState({ userList });
		});
		findAuditStoresCityByAuditCycleReportList(this.props.params.auditCycleId).then((cityList) => {
			this.setState({ cityList:cityList.city_list });
		});
		// findAuditStoresByAuditCycleList(this.props.params.auditCycleId,{lastAuditId, status, userId, start_date, end_date}).then((result)=>{
		// 	console.log("storessss",result)
		// })
	}
	componentWillReceiveProps(nextProps){
		if(nextProps.params.auditCycleId !== this.props.params.auditCycleId || (nextProps.location.state && nextProps.location.state.reload)){
			this.reloadReports(nextProps.params.auditCycleId);
		}
	}
	statusChanged = (e) => {
		let status = e.target.value;
		let lastAuditId = "";
		let userId = this.state.userId;
		let city = this.state.cityList.city;
		let start_date = this.state.start_date;
		let end_date = this.state.end_date;
		this.setState({
			filterStatus: status,
			auditStores: []
		});
		this.setLoading(true);
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
			this.setState({
				auditStores: response.audit_store_list,
				totalAuditStoreCount: response.total_audit_count
			});
			this.setLoading(false);
		});
	};
	userChanged = (e) => {
		let userId = e.target.value;
		let city = this.state.cityList.city;
		let lastAuditId = "";
		let status = this.state.filterStatus;
		let start_date = this.state.start_date;
		let end_date = this.state.end_date;
		this.setState({
			userId: userId,
			auditStores: []
		});
		this.setLoading(true);
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
			this.setState({
				auditStores: response.audit_store_list,
				totalAuditStoreCount: response.total_audit_count
			});
			this.setLoading(false);
		});
	};
	cityChanged = (e) => {
		let city = e.target.value;
		let userId = this.state.userId;
		let lastAuditId = "";
		let status = this.state.filterStatus;
		let start_date = this.state.start_date;
		let end_date = this.state.end_date;
		this.setState({
			city: city,
			auditStores: []
		});
		this.setLoading(true);
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
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
			let filters = {
				start_date: this.state.start_date,
				end_date: this.state.end_date,
			};
			acceptAllReports(this.props.params.auditCycleId, filters).then((count) => {
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
		let userId = this.state.userId;
		let city = this.state.cityList.city;
		let start_date = this.state.start_date;
		let end_date = this.state.end_date;
		findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
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

	startDateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				start_date: date.format("YYYY-MM-DD"),
			});
		}
	};

	endDateChanged = (date) => {
		if( typeof date !== "string"){
			this.setState({
				end_date: date.format("YYYY-MM-DD"),
			});
		}
	};

	findFilter = () => {
		if(this.state.start_date === "" || this.state.end_date === ""){
			alert("Please select valid dates");
		}
		else{
			let userId = this.state.userId;
			let city = this.state.city;
			let status = this.state.filterStatus;
			let start_date = this.state.start_date;
			let end_date = this.state.end_date;
			let lastAuditId = "";
			this.setState({
				auditStores: []
			});
			this.setLoading(true);
			findAuditStoresByAuditCycleNew(this.props.params.auditCycleId, {lastAuditId, status, userId,city, start_date, end_date}).then((response) => {
				this.setState({
					auditStores: response.audit_store_list,
					totalAuditStoreCount: response.total_audit_count
				});
				this.setLoading(false);
			});
		}
	};

	clearFilter = () => {
		this.setState({
			start_date:"",
			end_date:"",
			filterStatus:"",
			userId:"",
			city:"",
		});
		this.reloadReports(this.props.params.auditCycleId);
	};
	// toggleAuditReportsVisibility(reportId) {
	// 	this.setState(prevState =>
	// 	({
	// 		visibleReports: prevState.visibleReports.includes(reportId)
	// 			? prevState.visibleReports.filter(id => id !== reportId)
	// 			: [...prevState.visibleReports, reportId]
	// 	}),
	// 	 () =>
	// 	 {	// Call the function only if the report is being opened
	// 		if (this.state.visibleReports.includes(reportId)) {
	// 			findAuditStoresByAuditCycleReportList(this.props.params.auditCycleId, reportId).then((result) => {
	// 				console.log("3511111", result.audit_reports);
	// 				this.setState({auditReportRows:result.audit_reports})
	// 			});
	// 		}
	// 	}
	// 	);
	// }
	toggleAuditReportsVisibility(reportId) {
		if (!this.state.visibleReports.includes(reportId)) {
			findAuditStoresByAuditCycleReportList(this.props.params.auditCycleId, reportId)
				.then((result) => {
					const updatedAuditReportRows = { ...this.state.auditReportRows };
					updatedAuditReportRows[reportId] = result.audit_reports;
					this.setState({
						auditReportRows: updatedAuditReportRows,
						visibleReports: [...this.state.visibleReports, reportId]
					});
				});
		} else {
			// If the report is already visible, simply toggle its visibility
			this.setState(prevState => ({
				visibleReports: prevState.visibleReports.filter(id => id !== reportId)
			}));
		}
	}
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
				if (this.state.visibleReports.includes(report.id)) {
					audit_report_rows.push(
						<AuditStoreTable auditStores={this.state.auditReportRows[report.id] || []}
							key={report.id}
							onUpdate={this.auditStoreUpdated}
							moderators={this.state.moderators} />
					);
				}
				rows.push(
					<div className="panel panel-default table-responsive" key={report.id}>
						<div className="panel-heading" onClick={() => this.toggleAuditReportsVisibility(report.id)} style={{cursor:"pointer"}}>
							<b>{report.store_name}</b>, {report.store_address}, {report.store_city} <span className="pull-right"><b>[Audit Count - {report.store_audit_count}]</b></span>
						</div>
						<div className={`panel-body ${this.state.visibleReports.includes(report.id) ? "" : "hidden"}`}>
							{audit_report_rows}
						</div>
					</div>
				);
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
		let users = this.state.userList;
		let citys = this.state.cityList;
		let user_option_list = [];
		if(users.length > 0){
			for(let user of users){
				user_option_list.push(<option key={user.user.id} value={user.user.id}>{user.user.email}</option>);
			}
		}

		let city_option_list = [];
		if(citys.length > 0){

			for(let city of citys){
				city_option_list.push(<option key={city} value={city}>{city}</option>);
			}
		}
		return(
			<div>
				<br/>
				<AuditStoreStatusSummary auditCycleId={this.props.params.auditCycleId}/>
				<div className="form-group">
					<select className="form-control" style={{display:"inline-block",width:"200px"}} value={this.state.filterStatus} onChange={this.statusChanged}>
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
					&nbsp;
					<select className="form-control" style={{display:"inline-block",width:"200px"}}  value={this.state.userId} onChange={this.userChanged}>
						<option value="">All User</option>
						{user_option_list}
					</select>
					&nbsp;
					<select className="form-control" style={{display:"inline-block",width:"200px"}}  value={this.state.city} onChange={this.cityChanged}>
						<option value="">City</option>
						{city_option_list}
					</select>
					&nbsp;
					<div style={{width: "150px",display: "inline-block"}}>
						<label className="control-label" style={{fontSize: "14px"}}>&nbsp;Start Date:</label>
						<Datetime name="start_date" value={this.state.start_date} onChange={this.startDateChanged} timeFormat={false} dateFormat="YYYY-MM-DD" closeOnSelect={true} placeholder="Select start date"/>
					</div>
					&nbsp;
					<div style={{width: "150px",display: "inline-block"}}>
						<label className="control-label" style={{fontSize: "14px"}}>&nbsp;End Date:</label>
						<Datetime name="end_date" value={this.state.end_date} onChange={this.endDateChanged} timeFormat={false} dateFormat="YYYY-MM-DD" closeOnSelect={true}/>
					</div>
					&nbsp;
					<div style={{width: "53px",display: "inline-block"}}>
						<button className="btn btn-primary" onClick={this.findFilter}>Find</button>
					</div>
					&nbsp;
					<div style={{width: "53px",display: "inline-block"}}>
						<button className="btn btn-primary" onClick={this.clearFilter}>Clear</button>
					</div>
					<div className="pull-right" style={{paddingTop:"25px"}}>
						<button className="btn btn-default" onClick={this.acceptAllClicked}>
							Accept All
						</button>
					</div>
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
