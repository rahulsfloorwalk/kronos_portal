import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchApplications } from '../../auditor/actions/application.js';
import { fetchAudits } from '../../auditor/actions/audit.js';
import { fetchProfileInfo } from '../../auditor/actions/profile_info.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import { Cross, ShareAlt } from '../Icons.jsx';
import { getAuditType, getAuditStatus, getAuditApplicationStatus } from '../../utils.js';
import { LabelValue_2_10 } from '../LabelValue.jsx';
import ApplicationStatusLabel from '../ApplicationStatusLabel.jsx';


var AuditRow = React.createClass({
	render: function(){
		let button, auditDate, textLabel;
		if( typeof this.props.application === "undefined" || this.props.application.status === "NOT_APPLIED"){
			let applyLink = `/audit/${this.props.audit.id}/apply`;
			let applyButton = <Link to={applyLink} className="btn btn-default"><ShareAlt/> Apply</Link>;
			button = applyButton;
			textLabel = <ApplicationStatusLabel status="NOT_APPLIED"/>;
		}
		else if( this.props.application.status === "APPLIED"){
			let cancelLink = `/audit/${this.props.audit.id}/cancel`;
			let cancelButton = <Link to={cancelLink} className="btn btn-default"><Cross/> Cancel</Link>;
			auditDate =  <span>Audit Date: <b>{this.props.application.audit_date}</b></span>;
			button = cancelButton;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} 
		else if( this.props.application.status === "APPROVED"){
			auditDate =  <span>Audit Date: <b>{this.props.application.audit_date}</b></span>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		} else {
			button = <br/>;
			textLabel = <ApplicationStatusLabel status={this.props.application.status}/>;
		}
		let fees = this.props.audit.earnings_per_audit ? <b>Fees: ₹ {this.props.audit.earnings_per_audit}, </b> : "";
		let reimb = this.props.audit.reimbursement ? <span>Reimbursement upto: <b>₹ {this.props.audit.reimbursement}</b></span> : "";

		let detailsElement = <ExpandableDetails details={this.props.audit.audit_cycle.description}/>;
		return (
				<div className="panel panel-default">
					<div className="panel-heading">
						<h4 className="panel-title"><b>{this.props.audit.audit_cycle.client.name}</b></h4>
					</div>
					<div className="panel-body">
						<div className="form-horizontal">
							<LabelValue_2_10 label="Type:" value={getAuditType(this.props.audit.audit_cycle.type)}/>
							<LabelValue_2_10 label="Location:" value={`${this.props.audit.store.location.name}, ${this.props.audit.store.location.city.name}`}/>
							<LabelValue_2_10 label="Fees:" value={<span>{fees}{reimb}</span>}/>
							<LabelValue_2_10 label="Dates:" value={`${this.props.audit.audit_cycle.start_date} to ${this.props.audit.audit_cycle.end_date}`}/>
							<LabelValue_2_10 label="Details:" value={detailsElement}/>
							<LabelValue_2_10 label="Status:" value={textLabel}/>
						</div>
						<p className="text-right">
							{auditDate}&nbsp;&nbsp;{button}
						</p>
					</div>
				</div>
		);
	},
});

var AuditList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAudits());
		this.props.dispatch(fetchProfileInfo());
		this.props.dispatch(fetchApplications());
	},
	render: function(){
		if( this.props.profileInfo && ! this.props.profileInfo.is_complete){
			return (
				<div className="jumbotron text-center">
					<h2>Please complete your personal information</h2>
					<p>We're sorry, but we need to know more about you to assign audits to you.</p>
				</div>
			);
		}
		var rows = [];
		for(var id in this.props.audits) {
			let application;
			for( let appId in this.props.applications){
				if( this.props.applications[appId].audit === Number(id)){
					application = this.props.applications[appId];
					break;
				}
			}
			rows.push(<AuditRow audit={this.props.audits[id]} application={application} key={id}/>);
		}
		if(rows.length > 0){
		return (
			<div>
				<h2 className="page-header">
					Available Audits
				</h2>
					{rows}
				{this.props.children}
			</div>
		);
		} else {
			return (
				<div className="jumbotron text-center">
					<h2>There are no audits available in your location right now.</h2>
					<h3>Thanks for checking in :)</h3>
					<p>We will keep you informed when new audits are available.</p>
				</div>
			);
		}
	},
});

var mapStoreToProps = function(store){
	return {
		profileInfo: store.profileInfo,
		audits: store.audits,
		applications: store.applications
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList); 
