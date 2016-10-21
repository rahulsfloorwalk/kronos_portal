import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchAudits } from '../../manager_actions.js'

var AuditRow = React.createClass({
	render: function(){
		var linkTo = `/audit/${this.props.audit.id}`;
		return (
			<tr>
				<td>{this.props.audit.client.name}</td>
				<td>{this.props.audit.type}</td>
				<td>{this.props.audit.status}</td>
				<td>{this.props.audit.start_date}</td>
				<td>{this.props.audit.end_date}</td>
				<td>{this.props.audit.audit_count}</td>
				<td>
					<Link to={linkTo} className="btn btn-default pull-right">View</Link>
				</td>
			</tr>
		);
	},
});

var AuditList = React.createClass({
	componentDidMount: function() {
		this.props.dispatch(fetchAudits());
	},
	render: function(){
		var rows = [];
		for(var id in this.props.audits) {
			rows.push(<AuditRow audit={this.props.audits[id]} key={id}/>);
		}
		return (
			<div>
				<h2 className="page-header">
					Audit List
				</h2>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>Client Name</th>
							<th>Audit Type</th>
							<th>Audit Status</th>
							<th>Start Date</th>
							<th>End Date</th>
							<th>Count</th>
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

var mapStoreToProps = function(store){
	return {
		audits: store.audits
	};
};

export default ReactRedux.connect(mapStoreToProps)(AuditList); 
