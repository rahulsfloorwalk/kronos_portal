import React from 'react';
import { Link } from 'react-router';

import moment from 'moment';
import { momentDateFormat }  from '../../config.js';

import { fetchUpcomingAuditStores } from '../service/audit_store.js';

import { Time } from '../../js/components/Icons.jsx';
import { getAuditType, getAuditStatus } from '../../js/utils.js';
import { LabelValue_2_10 } from '../../js/components/LabelValue.jsx';
import AuditStoreStatusLabel from '../../js/components/AuditStoreStatusLabel.jsx';
import Jumbotron from '../../js/components/Jumbotron.jsx';

var AuditStoreRow = React.createClass({
	render: function(){
		return (
			<tr>
				<td>{moment(this.props.auditStore.audit_date).format(momentDateFormat)}</td>
				<td>{this.props.auditStore.audit.audit_cycle.name}</td>
				<td>{this.props.auditStore.audit.store.location.city.name}</td>
				<td>
					{this.props.auditStore.audit.store.name}<br/>
					<small className="text-muted">{this.props.auditStore.audit.store.address}</small>
				</td>
				<td>{getAuditType(this.props.auditStore.audit.audit_cycle.type)}</td>
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
		fetchUpcomingAuditStores().then((auditStores) => {
			this.setState({
				auditStores
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
						<Time/> Upcoming Audits
					</h2>
					<table className="table table-striped">
						<thead>
							<tr>
								<th>Audit Date</th>
								<th>Audit Cycle</th>
								<th>City</th>
								<th>Store</th>
								<th>Type</th>
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
			return (<Jumbotron heading="there are no upcoming audits right now" para=""/>);
		}
	},
});

