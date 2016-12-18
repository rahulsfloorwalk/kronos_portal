import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAudit } from '../../manager/actions/audit.js';
import { fetchApplications } from '../../manager/actions/application.js';

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

var AuditDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAudit(this.props.params.auditId));
		this.props.dispatch(fetchApplications(this.props.params.auditId));
	},
	render: function(){
		if(! this.props.audit){
			return <Loading/>;
		}

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

		let addAuditLocationLink = `/audit/${this.props.params.auditId}/auditlocation/add`
		let linkTo = `/audit/${this.props.audit.id}/edit`;

		return (
			<div>
				<h2 className="page-header">Audit Details</h2>
				<Panel title={this.props.audit.client.name}>
					<Link to={linkTo} className="btn btn-default pull-right">Edit</Link>
					<p>Type: { getAuditType(this.props.audit.type) }</p>
					<p>Status: { getAuditStatus(this.props.audit.status) }</p>
					<p>Earnings Per Audit: ₹ { this.props.audit.earnings_per_audit }</p>
					<p>Start Date: { this.props.audit.start_date }</p>
					<p>End Date: { this.props.audit.end_date }</p>
					<p>Total Audits: { this.props.audit.audit_count }</p>
					<p>Description</p>
					<p>{ this.props.audit.description }</p>
				</Panel>
				<h2 className="page-header">
					<Link to={addAuditLocationLink} className="btn btn-default pull-right">Add</Link>
					Locations
				</h2>
				{auditLocations}
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		applications: (function(applications){
			var audit = store.audits[ownProps.params.auditId] || {};
			var auditlocations = audit.auditlocations || [];
			var alids = [];

			for( var al of auditlocations){
				alids.push(al.id);
			}

			var selectedApplications = [];
			for( var id in applications){
				if(alids.includes(applications[id].auditlocation)){
					selectedApplications.push(applications[id]);
				}
			}
			return selectedApplications;
		}(store.applications))
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditDetails);
