import React from "react";
import * as ReactRedux from "react-redux";
import { hashHistory, Link } from "react-router";

import moment from "moment";
import { momentDateFormat }  from "../../../../config.js";

import { getAuditorReports } from "../../service/auditor_stats.js";

import AuditStoreStatusLabel from "../../../components/AuditStoreStatusLabel.jsx";
import ApplicationStatusLabel from "../../../components/ApplicationStatusLabel.jsx";
import { King, Retweet, Inbox, Tasks, Pencil, File } from "../../../components/Icons.jsx";
import NavLink from "../../../components/NavLink.jsx";
import Panel from "../../../components/Panel.jsx";
import Loading from "../../../components/Loading.jsx";
import AuditStoreRating from "../../../components/AuditStoreRating.jsx";

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from "../../../utils.js";

export default class extends React.Component {
  state = {};

  componentDidMount() {
  	getAuditorReports(this.props.params.auditorId).then((stats)=> this.setState({
  		stats
  	}));
  }

  componentWillReceiveProps(nextProps) {
  	console.log("AuditCycleDetails#componentWillReceiveProps#nextProps", nextProps);
  }

  render() {
  	if(! this.state.stats){
  		return <Loading/>;
  	}
  	let audit_store_arr = this.state.stats.map((row) => {
  		let linkTo = `audit_store/${row.id}/report`;
  		return (
  			<tr key={row.id} onClick={() => hashHistory.push(linkTo)} style={{cursor:"pointer"}}>
  				<td>{row.audit__audit_cycle__client__name}</td>
  				<td>{row.audit__store__name}</td>
  				<td>{row.audit__audit_cycle__name}</td>
  				<td>{row.audit_date}</td>
  				<td><AuditStoreRating rating={row.qa_rating}/></td>
  				<td><AuditStoreStatusLabel status={row.status} /></td>
  			</tr>
  		);
  	});

  	return (
  		<div className="panel panel-default">
  			<div className="panel-heading">
  				<h4 className="panel-title">Audit Report Summary</h4>
  			</div>
  			<table className="table table-striped table-hover">
  				<tbody>
  					<tr>
  						<th>Client</th>
  						<th>Store</th>
  						<th>Audit Cycle</th>
  						<th>Audit Date</th>
  						<th>QA Rating</th>
  						<th>Status</th>
  					</tr>
  					{audit_store_arr}
  				</tbody>
  			</table>
  		</div>
  	);
  }
}
