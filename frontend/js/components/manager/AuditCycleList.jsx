import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../config.js';

import { Plus, Retweet } from '../Icons.jsx';
import AuditTypeLabel from '../AuditTypeLabel.jsx';
import { fetchAuditCycles } from '../../manager/actions/audit.js'
import { getAuditType, getAuditStatus } from '../../utils.js';

var AuditCycleRow = React.createClass({
	render: function(){
		var linkTo = `/audit_cycle/${this.props.auditCycle.id}/questionnaire`;
		return (
			<tr>
				<td>{this.props.auditCycle.name}</td>
				<td>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</td>
				<td>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</td>
				<td><AuditTypeLabel auditType={this.props.auditCycle.type}/></td>
				<td>{getAuditStatus(this.props.auditCycle.status)}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var AuditCycleList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAuditCycles(this.props.params.clientId));
	},
	render: function(){
		var rows = [];
		for(var id in this.props.auditCycles) {
			rows.push(<AuditCycleRow auditCycle={this.props.auditCycles[id]} key={id}/>);
		}
		var addAuditCycleLink = `/client/${this.props.params.clientId}/audit_cycle/add`;
		return (
			<div>
				<h3 className="page-header">
					<Link to={addAuditCycleLink} className="btn btn-default pull-right"><Plus/> Add Audit Cycle</Link>
					<Retweet/> Audit Cycles
				</h3>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Cycle Name</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Audit Type</th>
							<th>Audit Status</th>
							<th></th>
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
		auditCycles: store.auditCycles,
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditCycleList);
