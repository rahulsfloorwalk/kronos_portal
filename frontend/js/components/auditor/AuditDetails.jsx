import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchApplicationsForAudit } from '../../auditor_actions.js';
import { fetchAudit } from '../../auditor/actions/audit.js';

import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';

import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';

var AuditDetails = React.createClass({
	componentDidMount: function(){
		this.props.dispatch(fetchAudit(this.props.params.auditId));
		//this.props.dispatch(fetchApplicationsForAudit(this.props.params.auditId));
	},
	render: function(){
		if(! this.props.audit){
			return <Loading/>;
		}

		/*
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
			else {
				auditDate = application.audit_date;
				button = <span>{getAuditApplicationStatus(application.status)}</span>;
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
		*/

		var linkTo = `/audit/${this.props.audit.id}/edit`;

		return (
			<div>
				<h3 className="page-header">Audit Details</h3>
				<div className="row">
					<div className="col-md-4">
						<Panel title={this.props.audit.audit_cycle.client.name} noBody={true}>
							<table className="table table-border table-striped">
								<tbody>
									<tr>
										<td className="text-right">Type:</td>
										<th>{ getAuditType(this.props.audit.audit_cycle.type) }</th>
									</tr>
									<tr>
										<td className="text-right">Audit Fees: </td>
										<th>₹ { this.props.audit.audit_cycle.earnings_per_audit } per audit</th>
									</tr>
									<tr>
										<td className="text-right">Start Date:</td>
										<th>{ this.props.audit.audit_cycle.start_date }</th>
									</tr>
									<tr>
										<td className="text-right">End Date:</td> 
										<th>{ this.props.audit.audit_cycle.end_date }</th>
									</tr>
									<tr>
										<td colSpan="2">
											<p><strong>Description:</strong></p>
											<p>{ this.props.audit.audit_cycle.description }</p>
										</td>
									</tr>
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
