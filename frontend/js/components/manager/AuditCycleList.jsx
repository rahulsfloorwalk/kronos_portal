import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAuditCycles } from '../../manager/actions/audit.js'
import { getAuditType, getAuditStatus } from '../../utils.js';

var AuditCycleRow = React.createClass({
	render: function(){
		var linkTo = `/audit_cycle/${this.props.auditCycle.id}`;
		return (
			<tr>
				<td>{getAuditType(this.props.auditCycle.type)}</td>
				<td>{getAuditStatus(this.props.auditCycle.status)}</td>
				<td>{this.props.auditCycle.start_date}</td>
				<td>{this.props.auditCycle.end_date}</td>
				<td>{this.props.auditCycle.earnings_per_audit}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var AuditCycleList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAuditCycles(this.props.clientId));
	},
	render: function(){
		var rows = [];
		for(var id in this.props.auditCycles) {
			rows.push(<AuditCycleRow auditCycle={this.props.auditCycles[id]} key={id}/>);
		}
		var addAuditCycleLink = `/client/${this.props.clientId}/audit_cycle/add`;
		return (
			<div>
				<h2 className="page-header">
					<Link to={addAuditCycleLink} className="btn btn-primary pull-right">Add Audit Cycle</Link>
					Audit List
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Audit Type</th>
							<th>Audit Status</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Earnings</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
				{this.props.children}
			</div>
		);
	},
});

var mapStoreToProps = function(store, ownProps){
	return {
		clientId: ownProps.clientId,
		auditCycles: store.auditCycles,
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditCycleList); 
