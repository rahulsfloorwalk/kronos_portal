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
	},
	componentWillReceiveProps(nextProps){
		console.log("AuditCycleDetails#componentWillReceiveProps#nextProps", nextProps);
	},
	render: function(){
		if(! this.props.auditCycle){
			return <Loading/>;
		}

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
					<NavLink to={`/audit_cycle/${this.props.params.auditCycleId}/audit_store`}>Reports</NavLink>
				</ul>
				{this.props.children}
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
