import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditCycle } from '../../manager/actions/audit.js';
//import { fetchApplications } from '../../manager/actions/application.js';

import { Pencil } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditLocation = React.createClass({
	render: function(){
		return (
			<li><strong>{this.props.auditLocation.count}</strong> - {this.props.auditLocation.location.name}, {this.props.auditLocation.location.city.name}</li>
		);
	}
});

var AuditCycleDetails = React.createClass({
	childContextTypes: {
		auditCycleId: React.PropTypes.number
	},
	getChildContext: function() {
		return {
			auditCycleId: Number(this.props.params.auditCycleId)
		};
	},
	componentDidMount: function(){
		this.props.dispatch(fetchAuditCycle(this.props.params.auditCycleId));
		//this.props.dispatch(fetchApplications(this.props.params.auditId));
	},
	componentWillReceiveProps(nextProps){
		console.log("AuditCycleDetails#componentWillReceiveProps#nextProps", nextProps);
	},
	render: function(){
		if(! this.props.auditCycle){
			return <Loading/>;
		}

		/*
		var auditLocations = [];
		for( let al of this.props.audit.auditlocations){
			let rows = [];
			for( let app of this.props.applications){
				let auditorUrl = `/auditor/${app.profileinfo.user_id}`;
				let auditorLink = (<Link to={auditorUrl}>{app.profileinfo.first_name} { app.profileinfo.last_name}</Link>);
				let assignLink, rejectLink, completeLink, failLink;
				if( app.status === "APPLIED"){
					assignLink = (<Link to={`/audit/${this.props.params.auditId}/application/${app.id}/assign`} className="btn btn-primary">Assign</Link>);
					rejectLink = (<Link to={`/audit/${this.props.params.auditId}/application/${app.id}/reject`} className="btn btn-default">Reject</Link>);
				} else if( app.status === "ASSIGNED"){
					completeLink = (<Link to={`/audit/${this.props.params.auditId}/application/${app.id}/complete`} className="btn btn-primary">Complete</Link>);
					failLink = (<Link to={`/audit/${this.props.params.auditId}/application/${app.id}/fail`} className="btn btn-default">Fail</Link>);
				}
				if( app.auditlocation === al.id){
					rows.push(
						<tr key={app.id}>
							<td>{auditorLink}</td>
							<td>{app.profileinfo.mobile_number}</td>
							<td>{getAuditApplicationStatus(app.status)}</td>
							<td>{app.audit_date}</td>
							<td>{assignLink}{rejectLink}{completeLink}{failLink}</td>
						</tr>
					);
				}
			}

			let innerTable;

			if(rows.length > 0){
				innerTable = (
					<table className="table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Mobile</th>
								<th>Status</th>
								<th>Audit Date</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
				);
			} else {
				innerTable = (<p className="text-center text-muted">No applications for this location.</p>);
			}

			let editLink = `/audit/${this.props.params.auditId}/auditlocation/${al.id}/edit`;
			let panelTitle = (
				<span>
					<b className="">{al.count}</b> - {al.location.name}, {al.location.city.name}
					<Link to={editLink} className="btn btn-default pull-right">Edit</Link>
				</span>
			);
			auditLocations.push(
				<Panel key={al.id} title={panelTitle}>
					{innerTable}
				</Panel>
			);
		}
				<h2 className="page-header">
					<Link to={addAuditLocationLink} className="btn btn-default pull-right">Add</Link>
					Locations
				</h2>
				{auditLocations}
		*/

		//let addAuditLocationLink = `/audit/${this.props.params.auditId}/auditlocation/add`
		let editAuditCycleLink = `/audit_cycle/${this.props.auditCycle.id}/edit`;

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditCycle.client.id}`}>{this.props.auditCycle.client.name}</Link></li>
					<li className="active">Cycle: <b>{this.props.auditCycle.start_date}</b> to <b>{ this.props.auditCycle.end_date}</b></li>
				</ol>
				<h2 className="page-header">
					Audit Cycle Details
				</h2>
				<div className="row">
				<div className="col-md-6">
				<Panel title={this.props.auditCycle.client.name} noBody={true}>
					<table className="table table-striped">
						<tbody>
							<tr><td className="text-right">Type:</td><td><b>{ getAuditType(this.props.auditCycle.type) }</b></td></tr>
							<tr><td className="text-right">Status:</td><td><b>{ getAuditStatus(this.props.auditCycle.status) }</b></td></tr>
							<tr><td className="text-right">Earnings Per Audit:</td><td><b>₹ { this.props.auditCycle.earnings_per_audit }</b></td></tr>
							<tr><td className="text-right">Start Date:</td><td><b>{ this.props.auditCycle.start_date }</b></td></tr>
							<tr><td className="text-right">End Date:</td><td><b>{ this.props.auditCycle.end_date }</b></td></tr>
							<tr><td className="text-right">Description</td><td>{ this.props.auditCycle.description }</td></tr>
						</tbody>
					</table>
					<div className="panel-footer text-right">
						<Link to={editAuditCycleLink} className="btn btn-default"><Pencil/></Link>
					</div>
				</Panel>
				</div>
				</div>
				<ul className="nav nav-tabs">
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`}>Questionnaire</NavLink>
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit`}>Audits</NavLink>
				</ul>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
		//applications: (function(applications){
		//	var audit = store.audits[ownProps.params.auditId] || {};
		//	var auditlocations = audit.auditlocations || [];
		//	var alids = [];

		//	for( var al of auditlocations){
		//		alids.push(al.id);
		//	}

		//	var selectedApplications = [];
		//	for( var id in applications){
		//		if(alids.includes(applications[id].auditlocation)){
		//			selectedApplications.push(applications[id]);
		//		}
		//	}
		//	return selectedApplications;
		//}(store.applications))
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditCycleDetails);
