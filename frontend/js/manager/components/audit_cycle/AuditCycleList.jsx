import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../../../config.js';

import { Plus, Retweet } from '../../../components/Icons.jsx';
import AuditTypeLabel from '../../../components/AuditTypeLabel.jsx';
import { fetchAuditCyclesByClient } from '../../service/audit_cycle.js'
import { getAuditType, getAuditStatus } from '../../../utils.js';

var AuditCycleRow = React.createClass({
	render: function(){
		var linkTo = `/audit_cycle/${this.props.auditCycle.id}/questionnaire`;
		return (
			<tr>
				<td>{this.props.auditCycle.name}</td>
				<td>{moment(this.props.auditCycle.start_date).format(momentDateFormat)}</td>
				<td>{moment(this.props.auditCycle.end_date).format(momentDateFormat)}</td>
				<td><AuditTypeLabel auditType={this.props.auditCycle.type}/></td>
				<td>{this.props.auditCycle.questionnaire_type && this.props.auditCycle.questionnaire_type.name}</td>
				<td>{getAuditStatus(this.props.auditCycle.status)}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			auditCycles: [],
		};
	},
	componentDidMount: function() {
		fetchAuditCyclesByClient(this.props.params.clientId).then((auditCycles) => {
			this.setState({auditCycles});
		});
	},
	render: function(){
		let rows = [];
		for(let ac of this.state.auditCycles) {
			rows.push(<AuditCycleRow auditCycle={ac} key={ac.id}/>);
		}
		let addAuditCycleLink = `/client/${this.props.params.clientId}/audit_cycle/add`;
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
							<th>Questionnaire Type</th>
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
