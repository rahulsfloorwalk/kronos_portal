import React from 'react';
import * as ReactRedux from 'react-redux';
import { Link } from 'react-router';

import { fetchLatestAuditStores } from '../service/audit_store.js';

import { File } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
//jimport Jumbotron from '../Jumbotron.jsx';

var AuditStoreRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{this.props.auditStore.audit.store.name}</td>
				<td>{`${this.props.auditStore.audit.store.location.name}, ${this.props.auditStore.audit.store.location.city.name}`}</td>
				<td>{this.props.auditStore.audit_date}</td>
				<td>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</td>
				<td><Link to={`/audit_store/${this.props.auditStore.id}/section`} className="btn btn-default">View</Link></td>
			</tr>
		);
	},
});

export default React.createClass({
	getInitialState: function(){
		return {
			auditStores: []
		};
	},
	componentDidMount: function() {
		fetchLatestAuditStores().then((auditStores) => {
			this.setState({
				auditStores: auditStores
			});
		});
	},
	render: function(){
		var rows = [];
		for(var id in this.state.auditStores) {
			rows.push(<AuditStoreRow auditStore={this.state.auditStores[id]} key={id}/>);
		}
		if(rows.length > 0){
			return (
				<div>
					<h2 className="page-header">
						<File/> Latest Audit Reports
					</h2>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Store</th>
								<th>Location</th>
								<th>Date</th>
								<th>Type</th>
								<th>&nbsp;</th>
							</tr>
						</thead>
						<tbody>
							{rows}
						</tbody>
					</table>
					{this.props.children}
				</div>
			);
		} else {
			return null;
		}
	},
});

