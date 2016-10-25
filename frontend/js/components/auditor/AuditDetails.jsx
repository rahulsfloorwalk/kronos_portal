import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAudit, fetchApplicationsForAudit } from '../../auditor_actions.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus } from '../../utils.js';

var AuditLocation = React.createClass({
	render: function(){
	}
});

var AuditDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAudit(this.props.params.auditId));
		this.props.dispatch(fetchApplicationsForAudit(this.props.params.auditId));
	},
	render: function(){
		if(! this.props.audit){
			return <Loading/>;
		}

		var auditLocations = [];
		for( let al of this.props.audit.auditlocations){

			let application;
			for( var a of this.props.applications){
				if(a.auditlocation.id === al.id){
					application = a;
					break;
				}
			}

			let button;
			let auditDate;
			if( typeof application === "undefined" || application.status === "NOT_APPLIED"){
				let applyLink = `/audit/${this.props.audit.id}/location/${al.id}/apply`;
				let applyButton = <Link to={applyLink} className="btn btn-primary">Apply</Link>;
				button = applyButton;
			}
			else if( application.status === "APPLIED"){
				let cancelLink = `/audit/${this.props.audit.id}/location/${al.id}/cancel`;
				let cancelButton = <Link to={cancelLink} className="btn btn-default">Cancel</Link>;
				auditDate = application.audit_date;
				button = cancelButton;
			} 

			 auditLocations.push(
				<tr key={al.id}>
					<td>{al.location.city.name}</td>
					<td>{al.location.name}</td>
					<td>{al.count}</td>
					<td>{auditDate}</td>
					<td>
						{button}
					</td>
				</tr>
			);
		}

		var linkTo = `/audit/${this.props.audit.id}/edit`;

		return (
			<div>
				<h3 className="page-header">Audit Details</h3>
				<div className="row">
					<div className="col-md-4">
						<Panel title={this.props.audit.client.name} noBody={true}>
							<table className="table table-border table-striped">
								<tbody>
									<tr>
										<th>Type:</th>
										<td>{ getAuditType(this.props.audit.type) }</td>
									</tr>
									<tr>
										<th>Status: </th>
										<td>{ getAuditStatus(this.props.audit.status) }</td>
									</tr>
									<tr>
										<th>Start Date:</th> 
										<td>{ this.props.audit.start_date }</td>
									</tr>
									<tr>
										<th>End Date:</th> 
										<td>{ this.props.audit.end_date }</td>
									</tr>
									<tr>
										<th>Total Audits:</th> 
										<td>{ this.props.audit.audit_count }</td>
									</tr>
									<tr>
										<td colSpan="2">
											<p><strong>Description:</strong></p>
											<p>{ this.props.audit.description }</p>
										</td>
									</tr>
								</tbody>
							</table>
						</Panel>
					</div>
					<div className="col-md-8">
						<Panel title="Locations" noBody={true}>
							<table className="table table-striped">
								<thead>
									<tr>
										<th>City</th>
										<th>Location</th>
										<th>Audit Count</th>
										<th>Audit Date</th>
									</tr>
								</thead>
								<tbody>
									{auditLocations}
								</tbody>
							</table>
						</Panel>
					</div>
				</div>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		audit: store.audits[ownProps.params.auditId],
		applications: (function(applications){
			var retVal = [];
			for( var id in applications){
				if( applications[id].auditlocation.audit == ownProps.params.auditId){
					retVal.push(applications[id]);
				}
			}
			return retVal;
		})(store.applications)
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditDetails);
