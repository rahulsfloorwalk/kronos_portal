import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { fetchAuditCycle } from '../../manager/actions/audit.js';

import ExpandableDetails from '../ExpandableDetails.jsx';
import MarkdownViewer from '../MarkdownViewer.jsx';
import { Knight, King, Retweet, Inbox, Tasks, Pencil, File } from '../Icons.jsx';
import NavLink from '../NavLink.jsx';
import Panel from '../Panel.jsx';
import Loading from '../Loading.jsx';
import AuditCycleSummary from './AuditCycleSummary.jsx'

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
	},
	componentWillReceiveProps(nextProps){
		console.log("AuditCycleDetails#componentWillReceiveProps#nextProps", nextProps);
	},
	render: function(){
		if(! this.props.auditCycle){
			return <Loading/>;
		}

		let editAuditCycleLink = `/audit_cycle/${this.props.auditCycle.id}/edit`;
		let detailsElement = <ExpandableDetails details={<MarkdownViewer markdown={this.props.auditCycle.description}/>}/>;

		return (
			<div>
				<ol className="breadcrumb">
					<li><Link to="/client">Clients</Link></li>
					<li><Link to={`/client/${this.props.auditCycle.client.id}/audit_cycle`}><King/> {this.props.auditCycle.client.name}</Link></li>
					<li className="active"><Retweet/> {this.props.auditCycle.name}</li>
				</ol>
				<div className="row">
					<div className="col-md-4">
					<div className="panel panel-primary">
						<div className="panel-heading">
							<Link to={editAuditCycleLink} className="btn btn-default btn-sm pull-right">
								<Pencil/>
							</Link>
							<h4><Retweet/> Audit Cycle Details</h4>
						</div>
						<table className="table table-striped">
							<tbody>
								<tr><td className="text-right">Name:</td><td><b>{ this.props.auditCycle.name }</b></td></tr>
								<tr><td className="text-right">Client:</td><td><b>{ this.props.auditCycle.client.name }</b></td></tr>
								<tr><td className="text-right">Type:</td><td><b>{ getAuditType(this.props.auditCycle.type) }</b></td></tr>
								<tr><td className="text-right">Status:</td><td><b>{ getAuditStatus(this.props.auditCycle.status) }</b></td></tr>
								<tr><td className="text-right">Earnings Per Audit:</td><td><b>₹ { this.props.auditCycle.earnings_per_audit }</b></td></tr>
								<tr><td className="text-right">Reimbursement upto:</td><td><b>₹ { this.props.auditCycle.reimbursement }</b></td></tr>
								<tr><td className="text-right">Start Date:</td><td><b>{ moment(this.props.auditCycle.start_date).format(momentDateFormat) }</b></td></tr>
								<tr><td className="text-right">End Date:</td><td><b>{ moment(this.props.auditCycle.end_date).format(momentDateFormat) }</b></td></tr>
								<tr><td className="text-right">Description</td><td>{ detailsElement }</td></tr>
								<tr><td className="text-right">Post Approval Description</td><td><Link to={`/audit_cycle/${this.props.params.auditCycleId}/post_approval_description`}>View</Link></td></tr>
							</tbody>
						</table>
					</div>

					</div>
					<div className="col-md-8">
						<AuditCycleSummary auditCycleId = {this.props.auditCycle.id}/>
					</div>
				</div>
				<div className="row">
					<div className="col-md-12">
					<ul className="nav nav-tabs">
						<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/questionnaire`}><Tasks/> Questionnaire</NavLink>
						<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit`}><Inbox/> Audits</NavLink>
						<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit_store`}><File/> Reports</NavLink>
						<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/moderator`}><Knight/> Moderators</NavLink>
					</ul>
					{this.props.children}
					</div>
				</div>
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		auditCycle: store.auditCycles[ownProps.params.auditCycleId],
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditCycleDetails);
