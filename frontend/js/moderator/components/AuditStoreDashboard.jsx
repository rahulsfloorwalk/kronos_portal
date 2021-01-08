import React, { Component } from "react";
import PropTypes from "prop-types";
// import { hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat}  from "../../../config.js";

import { pointerStyle }  from "../../styles.js";

import {  } from "../../components/Icons.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";
import { getAuditStoreStatus } from "../../utils.js";

import Loading from "../../components/Loading.jsx";

import Jumbotron from "../../components/Jumbotron.jsx";

import { findPending, findCompleted } from "../service/audit_store.js";

import AuditorNameDisplay from "./AuditorNameDisplay.jsx";

class AuditStoreList2 extends Component{
	static propTypes = {
		auditStores: PropTypes.array,
		client: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
		};
	}

	openReportNewTab(id) {
		let url = `/static/moderator#/audit_store/${id}/report`;
		window.open(url);
	}

	render(){
		let reps = [];
		for(let as of this.props.auditStores){
			reps.push( <tr key={as.id} style={pointerStyle} onClick={() => this.openReportNewTab(as.id)}>
				{/* <tr key={as.id} style={pointerStyle} onClick={() => hashHistory.push(`/audit_store/${as.id}/report`)}> */}
				<td className="text-right">{as.id}</td>
				<td>{as.audit.audit_cycle.client.name}</td>
				<td>{as.audit.store.name}, {as.audit.store.city.name}</td>
				<td><AuditorNameDisplay user={as.user}/></td>
				<td className="text-right">{as.audit.earnings_per_audit}</td>
				<td className="text-right">{as.audit.reimbursement}</td>
				<td>{as.audit.store.city.name}</td>
				<td>{moment(as.audit_date).format(momentDateFormat)}</td>
				<td><AuditStoreStatusLabel status={as.status}/></td>
			</tr>);
		}

		if(reps.length === 0){
			return <Jumbotron key="empty" heading="there are no reports here" para="assigned reports will be visible here"/>;
		}
		return(
			<div className="panel panel-default">
				<div className="panel-heading">
					<h4 className="">{this.props.auditStores[0] && this.props.auditStores[0].audit.audit_cycle.client.name} - {this.props.auditStores.length} Reports</h4>
				</div>
				<table className="table table-hover table-striped">
					<thead>
						<tr>
							<th className="text-right">Report ID</th>
							<th>Client</th>
							<th>Store</th>
							<th>Auditor Name</th>
							<th className="text-right">Fees</th>
							<th className="text-right">Reimbursement</th>
							<th>City</th>
							<th>Audit Date</th>
							<th>Report Status</th>
						</tr>
					</thead>
					<tbody>
						{reps}
					</tbody>
				</table>
			</div>
		);
	}
}

class AuditStoreTables extends Component {
	static propTypes = {
		auditStores: PropTypes.array,
	};

	render(){
		let client_dict = {};
		for(let as of this.props.auditStores){
			if(!client_dict[as.audit.audit_cycle.client.id]){
				client_dict[as.audit.audit_cycle.client.id] = [];
			}
			client_dict[as.audit.audit_cycle.client.id].push(as);
		}

		let tables = [];
		for(let client_id in client_dict){
			tables.push(<AuditStoreList2 key={client_id} auditStores={client_dict[client_id]}/>);
		}
		return (<div className="container">
			<h2 className="page-header">{this.props.auditStores.length} Reports</h2>
			{tables}
		</div>);
	}
}

export default class AuditStoreDashboard extends Component {
	static propTypes = {
		location: PropTypes.object,
	};

	constructor(props){
		super(props);
		this.state = {
			qa_pending: [],
			qa_done: [],
			totalAuditStoreCount: 0,
			loading: false,
			loadMoreLoader: false,
			filterStatus: ""
		};
	}

	setLoading = (loading) => {
		this.setState(prevState => Object.assign({}, prevState, {loading}));
	};

	componentDidMount(){
		this.setLoading(true);
		let lastAuditStoreDate = "";
		if(this.props.location.query.type === "qa_done"){
			findCompleted(lastAuditStoreDate, this.state.filterStatus).then(auditStores => this.setState({qa_done: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
		} else {
			findPending(lastAuditStoreDate, this.state.filterStatus).then(auditStores => this.setState({qa_pending: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
		}
	}

	componentWillReceiveProps(nextProps){
		if(this.props.location.query.type !== nextProps.location.query.type){
			this.setLoading(true);
			let lastAuditStoreDate = "";
			if( nextProps.location.query.type === "qa_done"){
				findCompleted(lastAuditStoreDate, this.state.filterStatus).then(auditStores => this.setState({qa_done: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
			} else {
				findPending(lastAuditStoreDate, this.state.filterStatus).then(auditStores => this.setState({qa_pending: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
			}
		}
	}

	statusChanged(e, qa_type){
		this.setState({
			filterStatus: e.target.value
		});
		this.setLoading(true);
		let lastAuditStoreDate = "";
		if(qa_type === "qa_done"){
			findCompleted(lastAuditStoreDate, e.target.value).then(auditStores => this.setState({qa_done: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
		}
		else{
			findPending(lastAuditStoreDate, e.target.value).then(auditStores => this.setState({qa_pending: auditStores["auditStores"], totalAuditStoreCount: auditStores["count"]})).always(() => this.setLoading(false));
		}
	}

	loadMore(qa_type){
		this.setState({
			loadMoreLoader: true
		});
		if(qa_type === "qa_done"){
			let lastAuditStoreDate = this.state.qa_done[this.state.qa_done.length-1].audit_date;
			findCompleted(lastAuditStoreDate, this.state.filterStatus).then((auditStores) => {
				let newAuditStores = this.state.qa_done;
				for(let reports of auditStores.auditStores){
					let check_report = this.state.qa_done.filter(function(report){ return (report.id === reports.id); });
					if(check_report.length === 0){
						newAuditStores.push(reports);
					}
				}
				this.setState({
					qa_done: newAuditStores,
					loadMoreLoader: false
				});
			});
		}
		else{
			let lastAuditStoreDate = this.state.qa_pending[this.state.qa_pending.length-1].audit_date;
			findPending(lastAuditStoreDate, this.state.filterStatus).then((auditStores) => {
				let newAuditStores = this.state.qa_pending;
				for(let reports of auditStores.auditStores){
					let check_report = this.state.qa_pending.filter(function(report){ return (report.id === reports.id); });
					if(check_report.length === 0){
						newAuditStores.push(reports);
					}
				}
				this.setState({
					qa_pending: newAuditStores,
					loadMoreLoader: false
				});
			});
		}
	}

	render(){
		if(this.state.loading){
			return <Loading/>;
		}
		let loadMoreLoading;
		if(this.state.loadMoreLoader){
			loadMoreLoading = (<Loading/>);
		}
		let statusFilter;
		if(this.props.location.query.type === "qa_done"){
			let loadMoreButton;
			if(this.state.qa_done.length !== this.state.totalAuditStoreCount){
				loadMoreButton = (<center><button className="btn btn-default" onClick={() => this.loadMore("qa_done")}>Load More</button></center>);
			}
			statusFilter = (
				<select className="form-control" style={{display:"inline-block", width:"200px"}} value={this.state.filterStatus} onChange={(e) => this.statusChanged(e, "qa_done")}>
					<option value="">All Status</option>
					<option value="PM_REVIEW">{getAuditStoreStatus("PM_REVIEW")}</option>
					<option value="COMPLETED">{getAuditStoreStatus("COMPLETED")}</option>
					<option value="FAILED">{getAuditStoreStatus("FAILED")}</option>
					<option value="ACCEPTED">{getAuditStoreStatus("ACCEPTED")}</option>
					<option value="REJECTED">{getAuditStoreStatus("REJECTED")}</option>
				</select>
			);
			return (
				<div>
					<div className="container">
						<label>Status Filter : </label> &nbsp;
						{statusFilter}
					</div>
					<AuditStoreTables auditStores={this.state.qa_done}/>
					{loadMoreButton}
					{loadMoreLoading}
				</div>
			);
		} else {
			let loadMoreButton;
			if(this.state.qa_pending.length !== this.state.totalAuditStoreCount){
				loadMoreButton = (<center><button className="btn btn-default" onClick={() => this.loadMore("qa_pending")}>Load More</button></center>);
			}
			statusFilter = (
				<select className="form-control" style={{display:"inline-block", width:"200px"}} value={this.state.filterStatus} onChange={(e) => this.statusChanged(e, "qa_pending")}>
					<option value="">All Status</option>
					<option value="ASSIGNED">{getAuditStoreStatus("ASSIGNED")}</option>
					<option value="ACKNOWLEDGED">{getAuditStoreStatus("ACKNOWLEDGED")}</option>
					<option value="SUBMITTED">{getAuditStoreStatus("SUBMITTED")}</option>
				</select>
			);
			return (
				<div>
					<div className="container">
						<label>Status Filter : </label> &nbsp;
						{statusFilter}
					</div>
					<AuditStoreTables auditStores={this.state.qa_pending}/>
					{loadMoreButton}
					{loadMoreLoading}
				</div>
			);
		}
	}
}
