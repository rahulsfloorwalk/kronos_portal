import React, { Component } from "react";
import PropTypes from "prop-types";
import { hashHistory } from "react-router";

import moment from "moment";
import { momentDateFormat}  from "../../../config.js";

import { pointerStyle }  from "../../styles.js";

import {  } from "../../components/Icons.jsx";
import AuditStoreStatusLabel from "../../components/AuditStoreStatusLabel.jsx";

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
	render(){
		let reps = [];
		for(let as of this.props.auditStores){
			reps.push( <tr style={pointerStyle} onClick={() => hashHistory.push(`/audit_store/${as.id}/report`)}>
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
		return (<div>
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
		};
	}

	componentDidMount(){
		if(this.props.location.query.type === "qa_done"){
			findCompleted().then(auditStores => this.setState({qa_done: auditStores}));
		} else {
			findPending().then(auditStores => this.setState({qa_pending: auditStores}));
		}
	}

	componentWillReceiveProps(nextProps){
		if(this.props.location.query.type !== nextProps.location.query.type){
			if( nextProps.location.query.type === "qa_done"){
				findCompleted().then(auditStores => this.setState({qa_done: auditStores}));
			} else {
				findPending().then(auditStores => this.setState({qa_pending: auditStores}));
			}
		}
	}

	render(){
		if(this.props.location.query.type === "qa_done"){
			return <AuditStoreTables auditStores={this.state.qa_done}/>;
		} else {
			return <AuditStoreTables auditStores={this.state.qa_pending}/>;
		}
	}
}
